const express = require('express')

// connenction wiht DataBase
const pool = require('./db')


const app = express()
app.use(express.json()) 

app.get("/",(req,res)=>{
    res.send('Planner Backend is running!')
})

app.get("/users",async(req,res)=>{
    const result = await pool.query('SELECT * FROM users')
    res.json(result.rows)
})


// Check whether a session overlaps with another session belonging to the same user.
async function hasSessionOverlap(userId, startedAt, endedAt, excludeSessionId) {

    const result = await pool.query(
        `SELECT activity_sessions.id
         FROM activity_sessions
         JOIN timed_activities
         ON activity_sessions.activity_id = timed_activities.id
         WHERE timed_activities.user_id = $1
         AND activity_sessions.id <> $4
         AND activity_sessions.started_at < $3::timestamptz
         AND (
             activity_sessions.ended_at IS NULL
             OR activity_sessions.ended_at > $2::timestamptz
         )
         LIMIT 1`,
        [
            Number(userId),
            startedAt,
            endedAt,
            Number(excludeSessionId)
        ]
    );

    return result.rows.length > 0;
}


// ===================================
// Timed Activities API
// ===================================

// Create a new timed activity
app.post('/api/timed-activities',async(req,res)=>{
    const {user_id,title,color} = req.body
    if(!user_id || !title){
        return res.status(400).json({
            message: 'user_id and title are required'
        })
    }
    const result = await pool.query(`INSERT INTO timed_activities(user_id,title,color)
                                        VALUES($1,$2,$3)
                                            RETURNING *`,[user_id,title,color])
    
    res.status(201).json(result.rows[0])                                        
})

// Get all timed activities
app.get('/api/timed-activities/:userId', async(req,res)=>{
    const {userId} = req.params
    const result = await pool.query(`SELECT * FROM timed_activities 
                                        WHERE user_id = $1 
                                            ORDER BY id ASC`,[userId])
                                     
    res.json(result.rows)                                    
})

// Update a timed activity
app.patch('/api/timed-activities/:id',async(req,res)=>{
    const {id} = req.params
    const {title , color} = req.body

    const result = await pool.query(`UPDATE timed_activities
                                        SET title = COALESCE ($1 , title),
                                            color = COALESCE ($2 , color)
                                                WHERE id = $3
                                                    RETURNING *`,[title,color,id])

    if(result.rows.length === 0){
        return res.status(404).json({
            message: 'Activity not found'
        })
    }                                    

    res.json(result.rows[0])
})

// Delete a timed activity
app.delete('/api/timed-activities/:id',async(req,res)=>{
    const {id} = req.params

    const result = await pool.query(`DELETE FROM timed_activities
                                        WHERE id = $1
                                            RETURNING *`,[id])

    if(result.rows.length === 0){
        return res.status(404).json({
            message:'Activity not found'
        })
    }                                  
    
    res.json({
        message: 'Activity deleted successfully',
        activity: result.rows[0]
    })
})

// ===================================
// Activity Sessions API
// ===================================
// Create a new Session
app.post('/api/activity-sessions',async(req,res)=>{
    const {activity_id} = req.body

    if(!activity_id){
        return res.status(400).json({
            message: 'activity_id is required'
        })
    }

    const activeSession = await pool.query(`SELECT activity_sessions.* FROM activity_sessions
                                                JOIN timed_activities ON activity_sessions.activity_id = timed_activities.id
                                                    WHERE timed_activities.user_id = $1
                                                        AND activity_sessions.ended_at IS NULL`,[1])

    if(activeSession.rows.length > 0){
        return res.status(400).json({
            message: 'You already have an active session'
        })
    }

    const result = await pool.query(`INSERT INTO activity_sessions(activity_id,started_at)
                                        VALUES($1,NOW())
                                            RETURNING *`,[activity_id])

    res.status(201).json(result.rows[0])
})

// Create a Session manually with a custom start and end time
app.post('/api/activity-sessions/manual',async(req,res)=>{
    const {activity_id,started_at,ended_at,note_session} = req.body

    if(!activity_id || !started_at || !ended_at){
        return res.status(400).json({
            message: 'activity_id,started_at and ended_at are required'
        })
    }

    const start = new Date(started_at)
    const end = new Date(ended_at)

    if(end <= start){
        return res.status(400).json({
            message: 'ended_at must be later than started_at'
        })
    }

    const activityResult = await pool.query(`SELECT user_id FROM timed_activities
                                                WHERE id = $1`,[activity_id])

    if(activityResult.rows.length === 0){
        return res.status(404).json({
            message: 'Timed activity not found'
        })
    }                                            

    const userId = activityResult.rows[0].user_id

    const overlap = await hasSessionOverlap(userId,started_at,ended_at)

    if(overlap){
        return res.status(400).json({
            message: 'Session overlaps with an existing session'
        })
    }

    const result = await pool.query(`INSERT INTO activity_sessions(activity_id,started_at,ended_at,duration_minutes,note_session)
                                        VALUES($1,$2,$3,EXTRACT(EPOCH FROM ($3::timestamptz - $2::timestamptz)) /60 , $4)
                                            RETURNING *`,[activity_id,started_at,ended_at,note_session || null])

    res.status(201).json(result.rows[0])                                            
})

// Get all Sessions
app.get('/api/activity-sessions/:activityId', async(req,res)=>{
    const {activityId} = req.params
    const result = await pool.query(`SELECT * FROM activity_sessions 
                                        WHERE activity_id = $1 
                                            ORDER BY id ASC`,[activityId])
                                     
    res.json(result.rows)                                    
})

// Update a session, including its times and note
app.patch('/api/activity-sessions/:id', async (req, res) => {

    const { id } = req.params;

    const {
        started_at,
        ended_at,
        note_session
    } = req.body;

    // Find the session and get its owner
    const sessionResult = await pool.query(
        `SELECT
            activity_sessions.*,
            timed_activities.user_id
         FROM activity_sessions
         JOIN timed_activities
         ON activity_sessions.activity_id = timed_activities.id
         WHERE activity_sessions.id = $1`,
        [Number(id)]
    );

    if (sessionResult.rows.length === 0) {
        return res.status(404).json({
            message: 'Session not found'
        });
    }

    const session = sessionResult.rows[0];

    // Keep the old value if the field was not sent
    const newStartedAt =
        started_at !== undefined
            ? started_at
            : session.started_at;

    const newEndedAt =
        ended_at !== undefined
            ? ended_at
            : session.ended_at;

    // Validate the new time range
    if (newEndedAt !== null) {

        const start = new Date(newStartedAt);
        const end = new Date(newEndedAt);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                message: 'Invalid date format'
            });
        }

        if (end <= start) {
            return res.status(400).json({
                message: 'ended_at must be later than started_at'
            });
        }

        // Check for overlapping sessions
        const overlap = await hasSessionOverlap(
            session.user_id,
            newStartedAt,
            newEndedAt,
            Number(id)
        );

        if (overlap) {
            return res.status(400).json({
                message: 'Session overlaps with an existing session'
            });
        }
    }

    // Calculate duration again
    const result = await pool.query(
        `UPDATE activity_sessions
         SET
            started_at = $1::timestamptz,
            ended_at = $2::timestamptz,
            duration_minutes = CASE
                WHEN $2 IS NOT NULL
                THEN EXTRACT(
                    EPOCH FROM (
                        $2::timestamptz - $1::timestamptz
                    )
                ) / 60
                ELSE NULL
            END,
            note_session = $3
         WHERE id = $4
         RETURNING *`,
        [
            newStartedAt,
            newEndedAt,
            note_session !== undefined
                ? note_session
                : session.note_session,
            Number(id)
        ]
    );

    res.json(result.rows[0]);
});

// Stop an active session and calaulate its duration
app.patch('/api/activity-sessions/:id/stop',async(req,res)=>{

    const {id} = req.params

    const sessionResult = await pool.query(`SELECT * FROM activity_sessions
                                                WHERE id = $1`,[id])

    if(sessionResult.rows.length === 0){
        return res.status(404).json({
            message: 'Session not found'
        })
    }

    const session = sessionResult.rows[0]

    if(session.ended_at !== null){
        return res.status(400).json({
            message: 'Session has already ended'
        })
    }

    const result = await pool.query(`UPDATE activity_sessions
                                        SET ended_at = NOW() , duration_minutes = EXTRACT(EPOCH FROM (NOW() - started_at)) / 60
                                            WHERE id = $1
                                                RETURNING *`, [id])

    res.json(result.rows[0])                                            
})

// Delete a Session
app.delete('/api/activity-sessions/:id',async(req,res)=>{
    const {id} = req.params

    const result = await pool.query(`DELETE FROM activity_sessions
                                        WHERE id = $1
                                            RETURNING *`,[id])

    if(result.rows.length === 0){
        return res.status(404).json({
            message:'Activity not found'
        })
    }                                  
    
    res.json({
        message: 'Activity deleted successfully',
        activity: result.rows[0]
    })
})


// ===================================
// UnTimed Activities API
// ===================================

// Create a new Untimed Activity
app.post('/api/untimed-activities',async(req,res)=>{

    const{user_id,title,target_count} = req.body

    if(!user_id || !title || !target_count){
        return res.status(400).json({
            message: 'user_id,title and target_count are required'
        })
    }

    if(target_count < 1){
        return res.status(400).json({
            message: 'target_count must be at least 1'
        })
    }

    const result = await pool.query(`INSERT INTO untimed_activities(user_id,title,target_count)
                                        VALUES($1,$2,$3)
                                            RETURNING *`,[user_id,title,target_count])

        res.status(201).json(result.rows[0])                                          
})

// Get all Untimed Activities
app.get('/api/untimed-activities/:userId',async(req,res)=>{
    const {userId} = req.params
    const result = await pool.query(`SELECT * FROM untimed_activities 
                                        WHERE user_id = $1 
                                            ORDER BY id ASC`,[userId])
                                     
    res.json(result.rows)  
})

// Update a Untimed Activity
app.patch('/api/untimed-activities/:id',async(req,res)=>{
    const {id} = req.params
    const {title , target_count,is_active} = req.body

    const activityResult = await pool.query(`SELECT * FROM untimed_activities
                                                WHERE id = $1`,[id])
    
    if(activityResult.rows.length === 0){
        return res.status(404).json({
            message: 'Activity not found'
        })
    }    
    
    const activity = activityResult.rows[0]
    const newTitle = title ?? activity.title
    const newTargetCount = target_count ?? activity.target_count
    const newIsActive = is_active ?? activity.is_active

    if(newTitle.trim() === ''){
        return res.status(400).json({
            message: 'Title cannot be empty'
        })
    }
    if(newTargetCount < 1){
        return res.status(400).json({
            message: 'target_count must be at least 1'
        })
    }

    const result = await pool.query(`UPDATE untimed_activities
                                        SET title = $1 , target_count = $2 , is_active = $3
                                            WHERE id = $4
                                                RETURNING *`,[newTitle,newTargetCount,newIsActive,id])
                               
    res.json(result.rows[0])
})

// Delete a Untimed Activity
app.delete('/api/untimed-activities/:id',async(req,res)=>{
    const {id} = req.params

    const result = await pool.query(`DELETE FROM untimed_activities
                                        WHERE id = $1
                                            RETURNING *`,[id])

    if(result.rows.length === 0){
        return res.status(404).json({
            message:'Activity not found'
        })
    }                                  
    
    res.json({
        message: 'Activity deleted successfully',
        activity: result.rows[0]
    })
})


// ===================================
// UnTimed Activity Records API
// ===================================

// Create a new Untimed Activity Record
app.post('/api/untimed-activity-records',async(req,res)=>{
    const {activity_id,record_date} = req.body

    const recordResult = await pool.query(`SELECT * FROM untimed_activity_records
                                            WHERE activity_id = $1 AND record_date = $2`,[activity_id,record_date])

    if(recordResult.rows.length > 0){
        return res.status(400).json({
            message: 'Record already exists for this activity and date'
        })
    }

    const result = await pool.query(`INSERT INTO untimed_activity_records(activity_id,record_date,completed_count)
                                        VALUES($1,$2,1)
                                            RETURNING *`,[activity_id,record_date])

    res.status(201).json(result.rows[0])
})

// Get all Untimed Activity Records
app.get('/api/untimed-activity-records/:activityId',async(req,res)=>{
    const {activityId} = req.params
    const result = await pool.query(`SELECT * FROM untimed_activity_records
                                        WHERE activity_id = $1 
                                            ORDER BY id ASC`,[activityId])
                                     
    res.json(result.rows)  
})

// Update an Untimed Activity Record
app.patch('/api/untimed-activity-records/:id',async(req,res)=>{

    const {id} = req.params
    const {completed_count} = req.body

    const recordResult = await pool.query(`SELECT untimed_activity_records.* , untimed_activities.target_count
                                            FROM untimed_activity_records
                                                JOIN untimed_activities ON untimed_activity_records.activity_id = untimed_activities.id
                                                    WHERE untimed_activity_records.id = $1`,[id])

    if(recordResult.rows.length === 0){
        return res.status(404).json({
            message: 'Record not found'
        })
    }

    const record = recordResult.rows[0]

    if(completed_count < 0 || completed_count > record.target_count){
        res.status(400).json({
            message: 'completed_count must be between 0 and target_count'
        })
    }

    const result = await pool.query(`UPDATE untimed_activity_records
                                        SET completed_count = $1
                                            WHERE id = $2
                                                RETURNING *`,[completed_count,id])

    res.json(result.rows[0])                                                                                            
})

// Delete an Untimed Activity Record
app.delete('/api/untimed-activity-records/:id',async(req,res)=>{
    const {id} = req.params

    const result = await pool.query(`DELETE FROM untimed_activity_records
                                        WHERE id = $1
                                            RETURNING *`,[id])

    if(result.rows.length === 0){
        return res.status(404).json({
            message:'Activity Record not found'
        })
    }                                  
    
    res.json({
        message: 'Activity Record deleted successfully',
        activity: result.rows[0]
    })
})



app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})
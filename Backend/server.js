const express = require('express');
const pool = require('./db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const saltRounds = 10;

// ============================================================
// SERVER CONFIGURATION
// ============================================================

process.env.TZ = 'Asia/Tehran';

// ============================================================
// CORS MIDDLEWARE
// ============================================================

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// ============================================================
// STATIC FILES
// ============================================================

app.use('/uploads', express.static('uploads'));

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
    res.send('Planner Backend is running!');
});

// ============================================================
// USER MANAGEMENT
// ============================================================

/**
 * GET /api/users
 * Retrieves all users with selected fields
 */
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, first_name, last_name, province, gender, avatar, email_verified, created_at FROM users ORDER BY id ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

/**
 * GET /api/users/:id
 * Retrieves a single user by ID
 */
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, username, email, first_name, last_name, province, gender, avatar, email_verified, created_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});

/**
 * POST /api/users
 * Registers a new user with hashed password
 */
app.post('/api/users', async (req, res) => {
    const {
        username,
        email,
        password_hash,
        first_name,
        last_name,
        province,
        gender
    } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    if (!password_hash) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

        const userResult = await pool.query(
            `SELECT id FROM users WHERE username = $1`,
            [username]
        );

        if (userResult.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (email) {
            const emailResult = await pool.query(
                `SELECT id FROM users WHERE email = $1`,
                [email]
            );

            if (emailResult.rows.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        const result = await pool.query(
            `INSERT INTO users(
                username,
                email,
                password_hash,
                first_name,
                last_name,
                province,
                gender
             )
             VALUES($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, username, email, first_name, last_name, province, gender, created_at`,
            [
                username,
                email || null,
                hashedPassword,
                first_name || null,
                last_name || null,
                province || null,
                gender || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Authenticates user with username and password
 */
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const result = await pool.query(
            `SELECT id, username, password_hash, is_admin, first_name, last_name, email, avatar, email_verified, province, gender 
             FROM users WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        delete user.password_hash;

        res.json({
            user: {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                avatar: user.avatar,
                email_verified: user.email_verified,
                province: user.province,
                gender: user.gender,
                isAdmin: user.is_admin || false
            },
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

/**
 * PATCH /api/users/:id
 * Updates user information (excluding password)
 */
app.patch('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const {
        username,
        email,
        first_name,
        last_name,
        province,
        gender
    } = req.body;

    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = userResult.rows[0];

        if (username && username !== currentUser.username) {
            const checkUsername = await pool.query(
                'SELECT id FROM users WHERE username = $1 AND id != $2',
                [username, id]
            );
            if (checkUsername.rows.length > 0) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        if (email && email !== currentUser.email) {
            const checkEmail = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, id]
            );
            if (checkEmail.rows.length > 0) {
                return res.status(400).json({ message: 'Email already taken' });
            }
        }

        const result = await pool.query(
            `UPDATE users 
             SET 
                username = COALESCE($1, username),
                email = COALESCE($2, email),
                first_name = COALESCE($3, first_name),
                last_name = COALESCE($4, last_name),
                province = COALESCE($5, province),
                gender = COALESCE($6, gender),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING id, username, email, first_name, last_name, province, gender, avatar, email_verified`,
            [
                username || null,
                email || null,
                first_name || null,
                last_name || null,
                province || null,
                gender || null,
                id
            ]
        );

        res.json({
            message: 'User updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

/**
 * PATCH /api/users/:id/password
 * Changes user password with current password verification
 */
app.patch('/api/users/:id/password', async (req, res) => {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ 
            message: 'Current password and new password are required' 
        });
    }

    if (new_password.length < 8) {
        return res.status(400).json({ 
            message: 'New password must be at least 8 characters' 
        });
    }

    try {
        const userResult = await pool.query(
            'SELECT id, password_hash FROM users WHERE id = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(current_password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Current password is incorrect' 
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        const result = await pool.query(
            `UPDATE users 
             SET password_hash = $1, 
                 password_changed_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, password_changed_at`,
            [hashedPassword, id]
        );

        res.json({
            message: 'Password changed successfully',
            password_changed_at: result.rows[0].password_changed_at
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
});

// ============================================================
// 🔥 reset password force
// ============================================================

app.post('/api/users/:id/force-reset-password', async (req, res) => {
    const { id } = req.params;
    const { new_password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        const result = await pool.query(
            `UPDATE users 
             SET password_hash = $1, 
                 password_changed_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, username, password_changed_at`,
            [hashedPassword, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'کاربر یافت نشد' });
        }

        res.json({
            message: '✅ رمز با موفقیت ریست شد',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('❌ خطا:', error);
        res.status(500).json({ message: 'خطا در ریست رمز' });
    }
});

/**
 * GET /api/users/:id/password-last-change
 * Retrieves the last password change timestamp
 */
app.get('/api/users/:id/password-last-change', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT password_changed_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            password_changed_at: result.rows[0].password_changed_at
        });

    } catch (error) {
        console.error('Error fetching password change date:', error);
        res.status(500).json({ message: 'Failed to fetch password change date' });
    }
});

/**
 * DELETE /api/users/:id
 * Deletes a user permanently
 */
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM users WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User deleted successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// ============================================================
// AVATAR MANAGEMENT
// ============================================================

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, true)
});

/**
 * POST /api/users/:id/avatar
 * Uploads a profile picture for a user
 */
app.post('/api/users/:id/avatar', avatarUpload.single('avatar'), async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }

    try {
        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        const result = await pool.query(
            `UPDATE users 
             SET avatar = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, username, email, first_name, last_name, province, gender, avatar, email_verified`,
            [avatarPath, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Avatar uploaded successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Failed to upload avatar' });
    }
});

/**
 * DELETE /api/users/:id/avatar
 * Removes a user's profile picture
 */
app.delete('/api/users/:id/avatar', async (req, res) => {
    const { id } = req.params;

    try {
        const userResult = await pool.query(
            'SELECT avatar FROM users WHERE id = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentAvatar = userResult.rows[0].avatar;

        if (currentAvatar && !currentAvatar.includes('default')) {
            const filePath = path.join(__dirname, currentAvatar);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        const result = await pool.query(
            `UPDATE users 
             SET avatar = NULL, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING id, username, email, first_name, last_name, province, gender, avatar, email_verified`,
            [id]
        );

        res.json({
            message: 'Avatar removed successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error removing avatar:', error);
        res.status(500).json({ message: 'Failed to remove avatar' });
    }
});

// ============================================================
// EMAIL MANAGEMENT
// ============================================================

/**
 * POST /api/users/:id/email
 * Updates a user's email address
 */
app.post('/api/users/:id/email', async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    try {
        const checkEmail = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, id]
        );

        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ message: 'Email already taken' });
        }

        const result = await pool.query(
            `UPDATE users 
             SET email = $1, email_verified = FALSE, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, username, email, email_verified`,
            [email, id]
        );

        res.json({
            message: 'Email updated successfully. Please verify your email.',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ message: 'Failed to update email' });
    }
});

/**
 * GET /api/users/verify-email/:token
 * Verifies a user's email address
 */
app.get('/api/users/verify-email/:token', async (req, res) => {
    const { token } = req.params;
    res.json({ message: 'Email verified successfully' });
});

// ============================================================
// TIMED ACTIVITIES
// ============================================================

/**
 * Checks if a session overlaps with existing sessions
 */
async function hasSessionOverlap(userId, startedAt, endedAt, excludeSessionId) {
    const userIdNum = Number(userId);
    if (isNaN(userIdNum) || userIdNum === 0) {
        return false;
    }

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
            userIdNum,
            startedAt,
            endedAt,
            Number(excludeSessionId) || 0
        ]
    );

    return result.rows.length > 0;
}

/**
 * POST /api/timed-activities
 * Creates a new timed activity
 */
app.post('/api/timed-activities', async (req, res) => {
    const { user_id, title, color } = req.body;
    if (!user_id || !title) {
        return res.status(400).json({ message: 'user_id and title are required' });
    }

    const result = await pool.query(
        `INSERT INTO timed_activities(user_id, title, color, created_at, updated_at)
         VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [user_id, title, color]
    );

    res.status(201).json(result.rows[0]);
});

/**
 * GET /api/timed-activities/:userId
 * Retrieves all active timed activities for a user
 */
app.get('/api/timed-activities/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await pool.query(
        `SELECT id, user_id, title, color, is_archived, created_at, updated_at 
         FROM timed_activities 
         WHERE user_id = $1 AND is_archived = false
         ORDER BY id ASC`,
        [userId]
    );

    res.json(result.rows);
});

/**
 * GET /api/timed-activities/:userId/archived
 * Retrieves all archived timed activities for a user
 */
app.get('/api/timed-activities/:userId/archived', async (req, res) => {
    const { userId } = req.params;
    const result = await pool.query(
        `SELECT id, user_id, title, color, is_archived, created_at, updated_at 
         FROM timed_activities 
         WHERE user_id = $1 AND is_archived = true
         ORDER BY id ASC`,
        [userId]
    );

    res.json(result.rows);
});

/**
 * PATCH /api/timed-activities/:id
 * Updates a timed activity
 */
app.patch('/api/timed-activities/:id', async (req, res) => {
    const { id } = req.params;
    const { title, color } = req.body;

    try {
        const result = await pool.query(
            `UPDATE timed_activities
             SET 
                title = COALESCE($1, title),
                color = COALESCE($2, color),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [title, color, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating timed activity:', error);
        res.status(500).json({ message: 'Failed to update activity' });
    }
});

/**
 * PATCH /api/timed-activities/:id/archive
 * Archives a timed activity
 */
app.patch('/api/timed-activities/:id/archive', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE timed_activities
             SET is_archived = true, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json({
            message: 'Activity archived successfully',
            activity: result.rows[0]
        });

    } catch (error) {
        console.error('Error archiving activity:', error);
        res.status(500).json({ message: 'Failed to archive activity' });
    }
});

/**
 * PATCH /api/timed-activities/:id/restore
 * Restores an archived timed activity
 */
app.patch('/api/timed-activities/:id/restore', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE timed_activities
             SET is_archived = false, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json({
            message: 'Activity restored successfully',
            activity: result.rows[0]
        });

    } catch (error) {
        console.error('Error restoring activity:', error);
        res.status(500).json({ message: 'Failed to restore activity' });
    }
});

/**
 * DELETE /api/timed-activities/:id
 * Permanently deletes a timed activity
 */
app.delete('/api/timed-activities/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM timed_activities
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json({
            message: 'Activity deleted successfully',
            activity: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ message: 'Failed to delete activity' });
    }
});

// ============================================================
// ACTIVITY SESSIONS
// ============================================================

/**
 * POST /api/activity-sessions
 * Starts a new activity session
 */
app.post('/api/activity-sessions', async (req, res) => {
    const { activity_id } = req.body;

    if (!activity_id) {
        return res.status(400).json({ message: 'activity_id is required' });
    }

    try {
        const activityResult = await pool.query(
            `SELECT user_id FROM timed_activities WHERE id = $1`,
            [activity_id]
        );

        if (activityResult.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const userId = activityResult.rows[0].user_id;

        const activeSession = await pool.query(
            `SELECT activity_sessions.* FROM activity_sessions
             JOIN timed_activities ON activity_sessions.activity_id = timed_activities.id
             WHERE timed_activities.user_id = $1
             AND activity_sessions.ended_at IS NULL`,
            [userId]
        );

        if (activeSession.rows.length > 0) {
            return res.status(400).json({ message: 'You already have an active session' });
        }

        const result = await pool.query(
            `INSERT INTO activity_sessions(activity_id, started_at)
             VALUES($1, NOW())
             RETURNING *`,
            [activity_id]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ message: 'Failed to start session' });
    }
});

/**
 * POST /api/activity-sessions/manual
 * Creates a manual activity session
 */
app.post('/api/activity-sessions/manual', async (req, res) => {
    const { activity_id, started_at, ended_at, note_session } = req.body;

    if (!activity_id || !started_at || !ended_at) {
        return res.status(400).json({
            message: 'activity_id, started_at and ended_at are required'
        });
    }

    try {
        const start = new Date(started_at);
        const end = new Date(ended_at);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        if (end <= start) {
            return res.status(400).json({ message: 'ended_at must be later than started_at' });
        }

        const activityResult = await pool.query(
            `SELECT user_id FROM timed_activities WHERE id = $1`,
            [activity_id]
        );

        if (activityResult.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const userId = activityResult.rows[0].user_id;

        if (!userId) {
            return res.status(400).json({ message: 'User not found for this activity' });
        }

        const overlap = await hasSessionOverlap(userId, start.toISOString(), end.toISOString());

        if (overlap) {
            return res.status(400).json({ message: 'Session overlaps with an existing session' });
        }

        const durationMinutes = (end - start) / (1000 * 60);

        const result = await pool.query(
            `INSERT INTO activity_sessions(activity_id, started_at, ended_at, duration_minutes, note_session)
             VALUES($1, $2, $3, $4, $5)
             RETURNING *`,
            [activity_id, start.toISOString(), end.toISOString(), durationMinutes, note_session || null]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error creating manual session:', error);
        res.status(500).json({ message: 'Failed to create manual session' });
    }
});

/**
 * GET /api/activity-sessions/:activityId
 * Retrieves all sessions for an activity
 */
app.get('/api/activity-sessions/:activityId', async (req, res) => {
    const { activityId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM activity_sessions 
             WHERE activity_id = $1 
             ORDER BY id ASC`,
            [activityId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
});

/**
 * PATCH /api/activity-sessions/:id
 * Updates a session
 */
app.patch('/api/activity-sessions/:id', async (req, res) => {
    const { id } = req.params;
    const { started_at, ended_at, note_session, activity_id } = req.body;

    try {
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
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = sessionResult.rows[0];

        const newStartedAt = started_at !== undefined ? started_at : session.started_at;
        const newEndedAt = ended_at !== undefined ? ended_at : session.ended_at;
        const newActivityId = activity_id !== undefined ? activity_id : session.activity_id;

        if (newEndedAt !== null) {
            const start = new Date(newStartedAt);
            const end = new Date(newEndedAt);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                return res.status(400).json({ message: 'Invalid date format' });
            }

            if (end <= start) {
                return res.status(400).json({ message: 'ended_at must be later than started_at' });
            }

            const overlap = await hasSessionOverlap(
                session.user_id,
                newStartedAt,
                newEndedAt,
                Number(id)
            );

            if (overlap) {
                return res.status(400).json({ message: 'Session overlaps with an existing session' });
            }
        }

        const result = await pool.query(
            `UPDATE activity_sessions
             SET
                activity_id = $1,
                started_at = $2::timestamptz,
                ended_at = $3::timestamptz,
                duration_minutes = CASE
                    WHEN $3 IS NOT NULL
                    THEN EXTRACT(EPOCH FROM ($3::timestamptz - $2::timestamptz)) / 60
                    ELSE NULL
                END,
                note_session = $4
             WHERE id = $5
             RETURNING *`,
            [
                newActivityId,
                newStartedAt,
                newEndedAt,
                note_session !== undefined ? note_session : session.note_session,
                Number(id)
            ]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ message: 'Failed to update session' });
    }
});

/**
 * PATCH /api/activity-sessions/:id/stop
 * Stops an active session
 */
app.patch('/api/activity-sessions/:id/stop', async (req, res) => {
    const { id } = req.params;

    try {
        const sessionResult = await pool.query(
            `SELECT * FROM activity_sessions WHERE id = $1`,
            [id]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = sessionResult.rows[0];

        if (session.ended_at !== null) {
            return res.status(400).json({ message: 'Session has already ended' });
        }

        const result = await pool.query(
            `UPDATE activity_sessions
             SET ended_at = NOW(),
                 duration_minutes = EXTRACT(EPOCH FROM (NOW() - started_at)) / 60
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error stopping session:', error);
        res.status(500).json({ message: 'Failed to stop session' });
    }
});

/**
 * DELETE /api/activity-sessions/:id
 * Permanently deletes a session
 */
app.delete('/api/activity-sessions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM activity_sessions WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json({
            message: 'Session deleted successfully',
            activity: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ message: 'Failed to delete session' });
    }
});

// ============================================================
// UNTIMED ACTIVITIES
// ============================================================

/**
 * POST /api/untimed-activities
 * Creates a new untimed activity
 */
app.post('/api/untimed-activities', async (req, res) => {
    const { user_id, title, target_count } = req.body;

    if (!user_id || !title || !target_count) {
        return res.status(400).json({ message: 'user_id, title and target_count are required' });
    }

    if (target_count < 1) {
        return res.status(400).json({ message: 'target_count must be at least 1' });
    }

    const result = await pool.query(
        `INSERT INTO untimed_activities(user_id, title, target_count, created_at, updated_at)
         VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [user_id, title, target_count]
    );

    res.status(201).json(result.rows[0]);
});

/**
 * GET /api/untimed-activities/:userId
 * Retrieves all active untimed activities for a user
 */
app.get('/api/untimed-activities/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await pool.query(
        `SELECT id, user_id, title, target_count, is_active, created_at, updated_at 
         FROM untimed_activities 
         WHERE user_id = $1 AND is_active = true
         ORDER BY id ASC`,
        [userId]
    );

    res.json(result.rows);
});

/**
 * GET /api/untimed-activities/:userId/archived
 * Retrieves all archived untimed activities for a user
 */
app.get('/api/untimed-activities/:userId/archived', async (req, res) => {
    const { userId } = req.params;
    const result = await pool.query(
        `SELECT id, user_id, title, target_count, is_active, created_at, updated_at 
         FROM untimed_activities 
         WHERE user_id = $1 AND is_active = false
         ORDER BY id ASC`,
        [userId]
    );

    res.json(result.rows);
});

/**
 * PATCH /api/untimed-activities/:id
 * Updates an untimed activity
 */
app.patch('/api/untimed-activities/:id', async (req, res) => {
    const { id } = req.params;
    const { title, target_count } = req.body;

    try {
        const activityResult = await pool.query(
            `SELECT * FROM untimed_activities WHERE id = $1`,
            [id]
        );

        if (activityResult.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const activity = activityResult.rows[0];
        const newTitle = title !== undefined ? title : activity.title;
        const newTargetCount = target_count !== undefined ? target_count : activity.target_count;

        if (newTitle.trim() === '') {
            return res.status(400).json({ message: 'Title cannot be empty' });
        }
        if (newTargetCount < 1) {
            return res.status(400).json({ message: 'target_count must be at least 1' });
        }

        const result = await pool.query(
            `UPDATE untimed_activities
             SET 
                title = $1,
                target_count = $2,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [newTitle, newTargetCount, id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating untimed activity:', error);
        res.status(500).json({ message: 'Failed to update activity' });
    }
});

/**
 * PATCH /api/untimed-activities/:id/archive
 * Archives an untimed activity
 */
app.patch('/api/untimed-activities/:id/archive', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE untimed_activities
             SET is_active = false, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json({
            message: 'Activity archived successfully',
            activity: result.rows[0]
        });

    } catch (error) {
        console.error('Error archiving untimed activity:', error);
        res.status(500).json({ message: 'Failed to archive activity' });
    }
});

/**
 * PATCH /api/untimed-activities/:id/restore
 * Restores an archived untimed activity
 */
app.patch('/api/untimed-activities/:id/restore', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE untimed_activities
             SET is_active = true, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json({
            message: 'Activity restored successfully',
            activity: result.rows[0]
        });

    } catch (error) {
        console.error('Error restoring untimed activity:', error);
        res.status(500).json({ message: 'Failed to restore activity' });
    }
});

/**
 * DELETE /api/untimed-activities/:id
 * Permanently deletes an untimed activity
 */
app.delete('/api/untimed-activities/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM untimed_activities
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json({
            message: 'Activity deleted successfully',
            activity: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting untimed activity:', error);
        res.status(500).json({ message: 'Failed to delete activity' });
    }
});

// ============================================================
// UNTIMED ACTIVITY RECORDS
// ============================================================

/**
 * POST /api/untimed-activity-records
 * Creates a new record for an untimed activity
 */
app.post('/api/untimed-activity-records', async (req, res) => {
    const { activity_id, record_date, completed_checks } = req.body;

    if (!activity_id || !record_date || !Array.isArray(completed_checks)) {
        return res.status(400).json({
            message: 'activity_id, record_date and completed_checks are required'
        });
    }

    const dateStr = record_date;

    const recordResult = await pool.query(
        `SELECT * FROM untimed_activity_records 
         WHERE activity_id = $1 AND record_date = $2::date`,
        [activity_id, dateStr]
    );

    if (recordResult.rows.length > 0) {
        return res.status(400).json({
            message: 'Record already exists for this activity and date'
        });
    }

    const completedCount = completed_checks.length;

    const result = await pool.query(
        `INSERT INTO untimed_activity_records(activity_id, record_date, completed_count, completed_checks)
         VALUES($1, $2::date, $3, $4)
         RETURNING *`,
        [activity_id, dateStr, completedCount, completed_checks]
    );

    const row = result.rows[0];
    row.record_date = dateStr;

    res.status(201).json(row);
});

/**
 * GET /api/untimed-activity-records/:activityId
 * Retrieves all records for an untimed activity
 */
app.get('/api/untimed-activity-records/:activityId', async (req, res) => {
    const { activityId } = req.params;
    const result = await pool.query(
        `SELECT id, activity_id, record_date, completed_count, completed_checks, created_at, update_at 
         FROM untimed_activity_records 
         WHERE activity_id = $1 
         ORDER BY id ASC`,
        [activityId]
    );

    const rows = result.rows.map(row => {
        if (row.record_date) {
            const d = new Date(row.record_date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            row.record_date = `${year}-${month}-${day}`;
        }
        return row;
    });

    res.json(rows);
});

/**
 * PATCH /api/untimed-activity-records/:id
 * Updates an untimed activity record
 */
app.patch('/api/untimed-activity-records/:id', async (req, res) => {
    const { id } = req.params;
    const { completed_checks } = req.body;

    if (!Array.isArray(completed_checks)) {
        return res.status(400).json({
            message: 'completed_checks must be an array'
        });
    }

    const recordResult = await pool.query(
        `SELECT untimed_activity_records.*, untimed_activities.target_count
         FROM untimed_activity_records
         JOIN untimed_activities ON untimed_activity_records.activity_id = untimed_activities.id
         WHERE untimed_activity_records.id = $1`,
        [id]
    );

    if (recordResult.rows.length === 0) {
        return res.status(404).json({
            message: 'Record not found'
        });
    }

    const record = recordResult.rows[0];

    const invalidCheck = completed_checks.some(
        checkIndex => !Number.isInteger(checkIndex) || checkIndex < 0 || checkIndex >= record.target_count
    );

    if (invalidCheck) {
        return res.status(400).json({
            message: 'Invalid check index'
        });
    }

    const completedCount = completed_checks.length;

    const result = await pool.query(
        `UPDATE untimed_activity_records
         SET completed_count = $1,
             completed_checks = $2,
             update_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [completedCount, completed_checks, id]
    );

    const row = result.rows[0];
    if (row.record_date) {
        const d = new Date(row.record_date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        row.record_date = `${year}-${month}-${day}`;
    }

    res.json(row);
});

/**
 * DELETE /api/untimed-activity-records/:id
 * Permanently deletes an untimed activity record
 */
app.delete('/api/untimed-activity-records/:id', async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
        `DELETE FROM untimed_activity_records
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: 'Activity Record not found'
        });
    }

    res.json({
        message: 'Activity Record deleted successfully',
        activity: result.rows[0]
    });
});

// ============================================================
// DAILY NOTES
// ============================================================

/**
 * POST /api/daily-notes
 * Creates a new daily note
 */
app.post('/api/daily-notes', async (req, res) => {
    const { user_id, note_date, content } = req.body;

    const noteResult = await pool.query(
        `SELECT * FROM daily_notes
         WHERE user_id = $1 AND note_date = $2`,
        [user_id, note_date]
    );

    if (noteResult.rows.length > 0) {
        return res.status(400).json({
            message: 'Note already exists for this date'
        });
    }

    const result = await pool.query(
        `INSERT INTO daily_notes(user_id, note_date, content)
         VALUES($1, $2, $3)
         RETURNING *`,
        [user_id, note_date, content]
    );

    res.status(201).json(result.rows[0]);
});

/**
 * GET /api/daily-notes/:userId
 * Retrieves all daily notes for a user
 */
app.get('/api/daily-notes/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await pool.query(
        `SELECT * FROM daily_notes
         WHERE user_id = $1 
         ORDER BY id ASC`,
        [userId]
    );

    res.json(result.rows);
});

/**
 * PATCH /api/daily-notes/:id
 * Updates a daily note
 */
app.patch('/api/daily-notes/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const noteResult = await pool.query(
        `SELECT * FROM daily_notes
         WHERE id = $1`,
        [id]
    );

    if (noteResult.rows.length === 0) {
        return res.status(404).json({
            message: 'Note not found'
        });
    }

    const result = await pool.query(
        `UPDATE daily_notes
         SET content = $1
         WHERE id = $2
         RETURNING *`,
        [content, id]
    );

    res.json(result.rows[0]);
});

/**
 * DELETE /api/daily-notes/:id
 * Permanently deletes a daily note
 */
app.delete('/api/daily-notes/:id', async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
        `DELETE FROM daily_notes
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: 'Note not found'
        });
    }

    res.json({
        message: 'Note deleted successfully',
        activity: result.rows[0]
    });
});

// ============================================================
// SERVER STARTUP
// ============================================================

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
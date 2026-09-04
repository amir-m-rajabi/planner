// ============================================================
// Frontend/js/api.js
// ============================================================

// Frontend/js/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'خطا در ارتباط با سرور');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================================
// Users API
// ============================================================

export const UsersAPI = {
    get: async (userId) => {
        return request(`/users/${userId}`);
    },

    update: async (userId, data) => {
        return request(`/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    uploadAvatar: async (userId, file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'خطا در آپلود تصویر');
        }

        return data;
    },

    deleteAvatar: async (userId) => {
        return request(`/users/${userId}/avatar`, {
            method: 'DELETE',
        });
    },

    setEmail: async (userId, email) => {
        return request(`/users/${userId}/email`, {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    login: async (username, password) => {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    changePassword: async (userId, currentPassword, newPassword) => {
        return request(`/users/${userId}/password`, {
            method: 'PATCH',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            }),
        });
    },

    getPasswordLastChange: async (userId) => {
        return request(`/users/${userId}/password-last-change`);
    }
};

// ============================================================
// Timed Activities API
// ============================================================

export const TimedActivitiesAPI = {
    getAll: async (userId) => {
        return request(`/timed-activities/${userId}`);
    },

    getArchived: async (userId) => {
        return request(`/timed-activities/${userId}/archived`);
    },

    create: async (userId, title, color) => {
        return request('/timed-activities', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, title, color }),
        });
    },

    update: async (id, data) => {
        return request(`/timed-activities/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    archive: async (id) => {
        return request(`/timed-activities/${id}/archive`, {
            method: 'PATCH',
        });
    },

    restore: async (id) => {
        return request(`/timed-activities/${id}/restore`, {
            method: 'PATCH',
        });
    },

    delete: async (id) => {
        return request(`/timed-activities/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================================
// Untimed Activities API
// ============================================================

export const UntimedActivitiesAPI = {
    getAll: async (userId) => {
        return request(`/untimed-activities/${userId}`);
    },

    getArchived: async (userId) => {
        return request(`/untimed-activities/${userId}/archived`);
    },

    create: async (userId, title, targetCount) => {
        return request('/untimed-activities', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, title, target_count: targetCount }),
        });
    },

    update: async (id, data) => {
        return request(`/untimed-activities/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    archive: async (id) => {
        return request(`/untimed-activities/${id}/archive`, {
            method: 'PATCH',
        });
    },

    restore: async (id) => {
        return request(`/untimed-activities/${id}/restore`, {
            method: 'PATCH',
        });
    },

    delete: async (id) => {
        return request(`/untimed-activities/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================================
// Untimed Records API
// ============================================================

export const UntimedRecordsAPI = {
    getByActivity: async (activityId) => {
        return request(`/untimed-activity-records/${activityId}`);
    },

    create: async (activityId, recordDate, completedChecks) => {
        return request('/untimed-activity-records', {
            method: 'POST',
            body: JSON.stringify({
                activity_id: activityId,
                record_date: recordDate,
                completed_checks: completedChecks
            }),
        });
    },

    update: async (id, completedChecks) => {
        return request(`/untimed-activity-records/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ completed_checks: completedChecks }),
        });
    },

    delete: async (id) => {
        return request(`/untimed-activity-records/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================================
// Activity Sessions API
// ============================================================

export const ActivitySessionsAPI = {
    getByActivity: async (activityId) => {
        return request(`/activity-sessions/${activityId}`);
    },

    getByDate: async (userId, date) => {
        const activities = await TimedActivitiesAPI.getAll(userId);
        let allSessions = [];
        for (const activity of activities) {
            const sessions = await request(`/activity-sessions/${activity.id}`);
            allSessions = [...allSessions, ...sessions];
        }
        const dateStr = new Date(date).toISOString().split('T')[0];
        return allSessions.filter(s => {
            const sDate = new Date(s.started_at).toISOString().split('T')[0];
            return sDate === dateStr;
        });
    },

    start: async (activityId) => {
        return request('/activity-sessions', {
            method: 'POST',
            body: JSON.stringify({ activity_id: activityId }),
        });
    },

    stop: async (sessionId) => {
        return request(`/activity-sessions/${sessionId}/stop`, {
            method: 'PATCH',
        });
    },

    createManual: async (activityId, startedAt, endedAt, note) => {
        return request('/activity-sessions/manual', {
            method: 'POST',
            body: JSON.stringify({
                activity_id: activityId,
                started_at: startedAt,
                ended_at: endedAt,
                note_session: note || null
            }),
        });
    },

    update: async (id, data) => {
        return request(`/activity-sessions/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    delete: async (id) => {
        return request(`/activity-sessions/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================================
// Daily Notes API
// ============================================================

export const DailyNotesAPI = {
    getByDate: async (userId, date) => {
        const allNotes = await request(`/daily-notes/${userId}`);
        const dateStr = new Date(date).toISOString().split('T')[0];
        return allNotes.find(note => note.note_date === dateStr) || null;
    },

    getAll: async (userId) => {
        return request(`/daily-notes/${userId}`);
    },

    create: async (userId, noteDate, content) => {
        return request('/daily-notes', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, note_date: noteDate, content }),
        });
    },

    update: async (id, content) => {
        return request(`/daily-notes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ content }),
        });
    },

    delete: async (id) => {
        return request(`/daily-notes/${id}`, {
            method: 'DELETE',
        });
    },
};
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongActivitiesService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylistSongActivity(playlistId, songId, userId, action) {
        const id = `activity-${nanoid(16)}`;
        const time = new Date().toISOString();

        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, userId, action, time],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menambah aktivitas');
        }
    }

    async getPlaylistSongActivitiesByPlaylisId(playlistId) {
        const query = {
            text: `SELECT playlists.id, users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
            FROM playlists
            LEFT JOIN playlist_song_activities ON playlist_song_activities.playlist_id = playlists.id
            LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
            LEFT JOIN users ON users.id = playlist_song_activities.user_id
            WHERE playlists.id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Aktifitas tidak ditemukan');
        }

        const activities = result.rows.map((activity) => ({
            username: activity.username,
            title: activity.title,
            action: activity.action,
            time: activity.time,
        }));

        return {
            playlistId: result.rows[0].id,
            activities,
        };
    }
}

module.exports = PlaylistSongActivitiesService;

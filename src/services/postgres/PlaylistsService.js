const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
    constructor(collaborationsService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];

        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username
            FROM playlists
            LEFT JOIN users ON users.id = playlists.owner
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
            WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async deletePlaylist(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = PlaylistsService;

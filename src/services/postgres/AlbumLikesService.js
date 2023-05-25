const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbumLike(userId, albumId) {
        const id = `like-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menyukai album');
        }

        return result.rows[0].id;
    }

    async getAlbumLike(albumId) {
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
            values: [albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return result.rowCount;
    }

    async deleteAlbumLike(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2  RETURNING id',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new NotFoundError('Gagal membatal');
        }

        return result.rows[0].id;
    }
}

module.exports = AlbumLikesService;

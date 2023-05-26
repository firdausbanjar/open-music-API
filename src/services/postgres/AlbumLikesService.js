const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async verifyAlbumLiked(userId, albumId) {
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if (result.rowCount) {
            throw new InvariantError('Sudah menyukai album');
        }
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

        await this._cacheService.delete(`album:${albumId}`);

        return result.rows[0].id;
    }

    async getAlbumLikes(albumId) {
        try {
            const result = await this._cacheService.get(`album:${albumId}`);
            return {
                result,
                cache: true,
            };
        } catch (error) {
            const query = {
                text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };

            const result = await this._pool.query(query);

            await this._cacheService.set(`album:${albumId}`, result.rowCount);

            return {
                result: result.rowCount,
                cache: false,
            };
        }
    }

    async deleteAlbumLike(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2  RETURNING id',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new NotFoundError('Gagal membatal. Album tidak ditemukan');
        }

        await this._cacheService.delete(`album:${albumId}`);
        return result.rows[0].id;
    }
}

module.exports = AlbumLikesService;

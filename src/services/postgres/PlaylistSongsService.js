const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylistSong(playlistId, songId) {
        const id = `playlistsong-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylistSongsByPlaylistId(playlistId) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username, songs.id as song_id, songs.title as song_title, songs.performer
            FROM playlists
            LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
            LEFT JOIN songs ON songs.id = playlist_songs.song_id
            LEFT JOIN users ON users.id = playlists.owner
            WHERE playlists.id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const songs = result.rows.map((song) => ({
            id: song.song_id,
            title: song.song_title,
            performer: song.performer,
        }));

        return {
            id: result.rows[0].id,
            name: result.rows[0].name,
            username: result.rows[0].username,
            songs,
        };
    }

    async deletePlaylistSong(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (songId === 123) console.log(`count: ${result.rowCount}`);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
        }
    }
}

module.exports = PlaylistSongsService;

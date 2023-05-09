/* eslint-disable no-unused-vars */
class PlaylistsHandler {
    constructor(playlistsService, playlistSongsService, songsService, validator) {
        this._playlistsService = playlistsService;
        this._playlistSongsService = playlistSongsService;
        this._songsService = songsService;
        this._validator = validator;
    }

    // ===============PLAYLIST HANDLER===============
    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

        const response = h.response({
            status: 'success',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._playlistsService.getPlaylists(credentialId);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistHandler(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(id, credentialId);
        await this._playlistsService.deletePlaylist(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }
    // ===============AKHIR PLAYLIST HANDLER===============

    // ===============PLAYLIST SONGS HANDLER===============
    async postPlaylistSongHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._songsService.verifySong(songId);
        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistSongsService.addPlaylistSong(playlistId, songId);

        const response = h.response({
            status: 'success',
            message: 'Berhasil menambah lagu ke playlist',
        });
        response.code(201);
        return response;
    }

    async getPlaylistSongByPlaylistIdHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        const playlist = await this._playlistSongsService.getPlaylistSongsByPlaylistId(playlistId);

        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deletePlaylistSongHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistSongsService.deletePlaylistSong(playlistId, songId);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }
    // ===============AKHIR PLAYLIST SONGS HANDLER===============
}

module.exports = PlaylistsHandler;

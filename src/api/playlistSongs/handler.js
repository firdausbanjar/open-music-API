/* eslint-disable no-unused-vars */
class PlaylistSongsHandler {
    constructor(playlistSongsService, playlistsService, songsService, validator) {
        this._playlistSongsService = playlistSongsService;
        this._playlistsService = playlistsService;
        this._songsService = songsService;
        this._validator = validator;
    }

    async postPlaylistSongHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._songsService.verifySong(songId);
        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
        const playlistSongId = await this._playlistSongsService.addPlaylistSong(playlistId, songId);

        const response = h.response({
            status: 'success',
            message: 'Berhasil menambah lagu ke playlist',
            data: {
                playlistSongId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistSongByPlaylistIdHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
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

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
        await this._playlistSongsService.deletePlaylistSong(playlistId, songId);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }
}

module.exports = PlaylistSongsHandler;

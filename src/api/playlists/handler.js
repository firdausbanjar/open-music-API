/* eslint-disable no-unused-vars */
class PlaylistsHandler {
    constructor(
        playlistsService,
        playlistSongsService,
        playlistSongActivitiesService,
        songsService,
        validator
    ) {
        this._playlistsService = playlistsService;
        this._playlistSongsService = playlistSongsService;
        this._playlistSongActivitiesService = playlistSongActivitiesService;
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
    // ===============PLAYLIST HANDLER===============

    // ===============PLAYLIST SONGS HANDLER===============
    async postPlaylistSongHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._songsService.verifySong(songId);
        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistSongsService.addPlaylistSong(playlistId, songId);
        await this._playlistSongActivitiesService.addPlaylistSongActivity(
            playlistId,
            songId,
            credentialId,
            'add'
        );

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
        await this._playlistSongActivitiesService.addPlaylistSongActivity(
            playlistId,
            songId,
            credentialId,
            'delete'
        );

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }
    // ===============PLAYLIST SONGS HANDLER===============

    // ===============PLAYLIST SONG ACTIVITIES HANDLER===============
    async getPlaylistSongActivitiesByPlaylistHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        const data = await this._playlistSongActivitiesService.getPlaylistSongActivitiesByPlaylisId(
            playlistId
        );

        return {
            status: 'success',
            data,
        };
    }
    // ===============PLAYLIST SONG ACTIVITIES HANDLER===============
}

module.exports = PlaylistsHandler;

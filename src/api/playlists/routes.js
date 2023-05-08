const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: (request, h) => handler.postPlaylistHandler(request, h),
        options: {
            auth: 'open_music_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: (request, h) => handler.getPlaylistHandler(request, h),
        options: {
            auth: 'open_music_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}',
        handler: (request, h) => handler.deletePlaylistHandler(request, h),
        options: {
            auth: 'open_music_jwt',
        },
    },
    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: (request, h) => handler.postPlaylistSongHandler(request, h),
        options: {
            auth: 'open_music_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{id}/songs',
        handler: (request, h) => handler.getPlaylistSongByPlaylistIdHandler(request, h),
        options: {
            auth: 'open_music_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}/songs',
        handler: (request, h) => handler.deletePlaylistSongHandler(request, h),
        options: {
            auth: 'open_music_jwt',
        },
    },
];

module.exports = routes;

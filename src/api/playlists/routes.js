const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: (request, h) => handler.postPlaylistHandler(request, h),
        options: {
            auth: 'openMusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: (request, h) => handler.getPlaylistHandler(request, h),
        options: {
            auth: 'openMusic_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}',
        handler: (request, h) => handler.deletePlaylistHandler(request, h),
        options: {
            auth: 'openMusic_jwt',
        },
    },
];

module.exports = routes;

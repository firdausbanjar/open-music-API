const config = require('../../utils/config');

class AlbumsHandler {
    constructor(
        albumsService,
        songsService,
        storageService,
        albumLikesService,
        usersService,
        validator
    ) {
        this._albumsService = albumsService;
        this._songsService = songsService;
        this._storageService = storageService;
        this._albumLikesService = albumLikesService;
        this._usersService = usersService;
        this._validator = validator;
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._albumsService.addAlbum({ name, year });

        const response = h.response({
            status: 'success',
            data: {
                albumId,
            },
        });
        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request) {
        const { id } = request.params;

        const album = await this._albumsService.getAlbumById(id);
        const songs = await this._songsService.getSogsByAlbumId(id);

        return {
            status: 'success',
            data: {
                album: {
                    id: album.id,
                    name: album.name,
                    year: album.year,
                    coverUrl:
                        album.cover === null
                            ? null
                            : `http://${config.app.host}:${config.app.port}/albums/images/${album.cover}`,
                    songs,
                },
            },
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._albumsService.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request) {
        const { id } = request.params;
        await this._albumsService.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }

    async postUploadCoverAlbumHandler(request, h) {
        const { cover } = request.payload;
        const { id } = request.params;

        this._validator.validateImageHeaders(cover.hapi.headers);

        const filename = await this._storageService.writeFile(cover, cover.hapi);
        await this._albumsService.uploadCoverById(id, filename);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }

    async postAlbumLikeHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._albumsService.verifyAlbumById(albumId);
        await this._usersService.verifyUserById(credentialId);
        await this._albumLikesService.verifyAlbumLiked(credentialId, albumId);
        await this._albumLikesService.addAlbumLike(credentialId, albumId);

        const response = h.response({
            status: 'success',
            message: 'Menyukai album',
        });
        response.code(201);
        return response;
    }

    async deleteAlbumLikeHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const { id: albumId } = request.params;

        await this._usersService.verifyUserById(credentialId);
        await this._albumLikesService.deleteAlbumLike(credentialId, albumId);

        return {
            status: 'success',
            message: 'Berhasil membatalkan',
        };
    }

    async getAlbumLikesHandler(request, h) {
        const { id } = request.params;

        const likes = await this._albumLikesService.getAlbumLikes(id);

        if (likes.cache) {
            const response = h.response({
                status: 'success',
                data: {
                    likes: Number(likes.result),
                },
            });
            response.code(200);
            response.header('X-Data-Source', 'cache');
            return response;
        }

        return {
            status: 'success',
            data: {
                likes: Number(likes.result),
            },
        };
    }
}

module.exports = AlbumsHandler;

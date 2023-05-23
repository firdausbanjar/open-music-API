const config = require('../../utils/config');

/* eslint-disable no-unused-vars */
class AlbumsHandler {
    constructor(albumsService, songsService, storageService, validator) {
        this._albumsService = albumsService;
        this._songsService = songsService;
        this._storageService = storageService;
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

    async getAlbumByIdHandler(request, h) {
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

    async putAlbumByIdHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._albumsService.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request, h) {
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
}

module.exports = AlbumsHandler;

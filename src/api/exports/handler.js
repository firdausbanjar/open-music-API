/* eslint-disable no-unused-vars */
class ExportsHandler {
    constructor(producerService, playlistsService, validator) {
        this._producerService = producerService;
        this._playlistsService = playlistsService;
        this._validator = validator;
    }

    async postExportPlaylistsHandler(request, h) {
        this._validator.validateExportPlaylistsPayload(request.payload);
        const { playlistId } = request.params;
        const { id: userId } = request.auth.credentials;

        const message = {
            userId,
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
        await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;

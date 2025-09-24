import { Injectable } from '@nestjs/common';

@Injectable()
export class GifValidatorService {
    private allowedHosts = ['media.tenor.com', 'media.giphy.com'];

    async validateGifUrl(url: string): Promise<boolean> {
        try {
            const host = new URL(url).hostname;

            // cek domain (whitelist)
            if (!this.allowedHosts.includes(host)) {
                return false;
            }

            // cek content-type (pastikan image/gif)
            const res = await fetch(url, { method: 'HEAD' });
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.startsWith('image/gif')) {
                return false;
            }

            return true;
        } catch (err) {
            return false;
        }
    }
}

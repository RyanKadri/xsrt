import crypto from 'crypto';

export function hash(data: any) {
    return crypto.createHash('sha1').update(data).digest('base64');
}
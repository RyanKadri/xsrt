import { Recording } from '../db/data';
import { Router } from 'express';

const router = Router();

router.route('/recordings')
.get((_, resp) => {
    Recording
        .find({ }, { metadata: 1 })
        .limit(15)
        .exec((err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json( data )
        })
}).post((req, resp) => {
    const recording = new Recording(req.body);
    recording.save((err, data) => {
        return err
            ? resp.json({ error: err })
            : resp.json( data )
    })
})

router.route('/recordings/:recordingId')
    .get((req, resp) => {
        Recording.findById(req.params.recordingId, (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json(data)
        });
    }).delete((req, resp) => {
        Recording.findByIdAndDelete(req.params.recordingId, (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json(data);
        })
    })

export const recordingRouter = router;
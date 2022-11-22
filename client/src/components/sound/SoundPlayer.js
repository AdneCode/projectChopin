import { useEffect } from 'react';
import { playSound } from './soundFunctions';
import { hat4, kick } from './sounds';
import {
    selectHotkeys,
    selectInstrument,
    setInstrument,
} from '../../store/hotkeys';
import { useDispatch, useSelector } from 'react-redux';

function SoundPlayer(p) {
    const dispatch = useDispatch();
    const hotkeys = useSelector(selectHotkeys());
    const instrument = useSelector(selectInstrument());

    const handleSound = (soundToPlay) => {
        const { sendSound, roomId } = p;
        if (!sendSound || !roomId) return playSound(soundToPlay.output);
        sendSound(soundToPlay.output, roomId);
    };
    const handleInstrument = (instrument) => {
        dispatch(setInstrument(instrument));
    };
    useEffect(() => {
        window.addEventListener('keydown', handleInput, false);
        return () => window.removeEventListener('keydown', handleInput, false);
    }, []);

    const handleInput = (e) => {
        if (!instrument || !hotkeys) return;
        const { key } = e;
        console.log(key);
        const checkKeys = (array) => {
            if (!array) return;
            const knownKeys = array.map((i) => {
                return i.key;
            });
            if (knownKeys.includes(key.toUpperCase())) {
                const soundToPlay = array.find((i) => {
                    if (i.key.toUpperCase() === key.toUpperCase()) return true;
                });
                handleSound(soundToPlay);
            }
            const instrumentKeys = ['!', '@', '#'];
            if (instrumentKeys.includes(key)) {
                if (key === '!') handleInstrument('drum');
                if (key === '@') handleInstrument('piano');
            }
        };
        if (instrument === 'drum') {
            checkKeys(hotkeys.drum);
        }
        if (instrument === 'piano') {
            checkKeys(hotkeys.piano);
        }
    };

    const RenderDrums = () => {
        return <></>;
    };
    return (
        <div>
            <RenderDrums />
        </div>
    );
}

export { SoundPlayer };

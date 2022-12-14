import { cnRecorderButton, cnRecorderButtonPhantom } from '../classNames';
import { StopIcon } from '@heroicons/react/24/outline';

function StopRecordButton(p) {
    const { phantom } = p;
    return (
        <button
            className={phantom ? cnRecorderButtonPhantom : cnRecorderButton}
        >
            <StopIcon className="flex-shrink-0 h-6 w-6 mr-2 fill-red-600" />{' '}
            Stop
        </button>
    );
}

export { StopRecordButton };

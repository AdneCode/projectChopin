import { useState } from 'react';
import { roomText } from '../classNames';
import { SoundPlayer, Displayer, Recorder, RecordListener } from '..';
import { UserList } from '.';
import { cnButton, whiteLabel } from '../../components/classNames';

const RenderRoom = (p) => {
    const { setId, id, room, socket, multiplayerFunctions } = p;
    const [inputId, setInputId] = useState('');
    if (!room || !id || !socket || !multiplayerFunctions) {
        return (
            <div className="flex flex-col flex-wrap border-4 rounded-xl border-gray-300 content-center text-center border-2 bg-gray-400 my-[10%] mx-[25%]">
                {socket ? (
                    <>
                        <h1 className={whiteLabel}>Multiplayer</h1>
                        <br />
                        <form>
                            <input
                                placeholder="Room ID"
                                value={inputId}
                                onChange={(e) => setInputId(e.target.value)}
                            />
                        </form>
                        <div className="flex flex-row">
                            <button
                                className={cnButton + ' my-4'}
                                onClick={() => {
                                    multiplayerFunctions.createRoom();
                                }}
                            >
                                Create room
                            </button>
                            <button
                                className={cnButton + ' my-4'}
                                onClick={() => {
                                    setId(inputId);
                                    multiplayerFunctions.joinRoom();
                                }}
                            >
                                Join room
                            </button>
                        </div>
                    </>
                ) : (
                    <div>Attempting to connect...</div>
                )}
            </div>
        );
    }

    if (!room || !room.roomId) return;
    return (
        <>
            <div className="py-4 border-4 border-b-0 border-stone-800 rounded-t-xl bg-stone-700 flex flex-wrap">
                <SoundPlayer
                    status="active"
                    sendSound={multiplayerFunctions.sendSound}
                    roomId={room.roomId}
                />
                <RecordListener
                    status="multiplayer"
                    sendSound={multiplayerFunctions.sendSound}
                    roomId={room.roomId}
                />
            </div>

            <div className="flex flex-row w-full relative  ">
                <Displayer />
                <div
                    className={`w-full border-t-4 border-b-4 border-r-4 bg-stone-700 border-stone-800 border-r-2 absolute bottom-0 left-0 flex flex-row `}
                >
                    <div
                        className={`${roomText} border-x-4 border-stone-800 bg-stone-700`}
                    >
                        {room.roomId}
                    </div>

                    <UserList />
                </div>
            </div>
            <div className="py-4 border-4 border-t-0 border-stone-800 rounded-b-xl bg-stone-700 flex flex-wrap">
                <Recorder />
            </div>
        </>
    );
};

export { RenderRoom };

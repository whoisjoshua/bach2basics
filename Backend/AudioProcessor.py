import asyncio
import websockets
import subprocess
import numpy as np
import librosa
import librosa.display
from matplotlib import pyplot as plt
import pandas as pd
from scipy.fft import fft, fftfreq
import scipy.io.wavfile as wav
import sounddevice as sd

NOTES_MAP = {
   "C0":   16.35,
  "C#0":   17.32,
  "Db0":   17.32,
   "D0":   18.35,
  "D#0":   19.45,
  "Eb0":   19.45,
   "E0":   20.60,
   "F0":   21.83,
  "F#0":   23.12,
  "Gb0":   23.12,
   "G0":   24.50,
  "G#0":   25.96,
  "Ab0":   25.96,
   "A0":   27.50,
  "A#0":   29.14,
  "Bb0":   29.14,
   "B0":   30.87,
   "C1":   32.70,
  "C#1":   34.65,
  "Db1":   34.65,
   "D1":   36.71,
  "D#1":   38.89,
  "Eb1":   38.89,
   "E1":   41.20,
   "F1":   43.65,
  "F#1":   46.25,
  "Gb1":   46.25,
   "G1":   49.00,
  "G#1":   51.91,
  "Ab1":   51.91,
   "A1":   55.00,
  "A#1":   58.27,
  "Bb1":   58.27,
   "B1":   61.74,
   "C2":   65.41,
  "C#2":   69.30,
  "Db2":   69.30,
   "D2":   73.42,
  "D#2":   77.78,
  "Eb2":   77.78,
   "E2":   82.41,
   "F2":   87.31,
  "F#2":   92.50,
  "Gb2":   92.50,
   "G2":   98.00,
  "G#2":  103.83,
  "Ab2":  103.83,
   "A2":  110.00,
  "A#2":  116.54,
  "Bb2":  116.54,
   "B2":  123.47,
   "C3":  130.81,
  "C#3":  138.59,
  "Db3":  138.59,
   "D3":  146.83,
  "D#3":  155.56,
  "Eb3":  155.56,
   "E3":  164.81,
   "F3":  174.61,
  "F#3":  185.00,
  "Gb3":  185.00,
   "G3":  196.00,
  "G#3":  207.65,
  "Ab3":  207.65,
   "A3":  220.00,
  "A#3":  233.08,
  "Bb3":  233.08,
   "B3":  246.94,
   "C4":  261.63,
  "C#4":  277.18,
  "Db4":  277.18,
   "D4":  293.66,
  "D#4":  311.13,
  "Eb4":  311.13,
   "E4":  329.63,
   "F4":  349.23,
  "F#4":  369.99,
  "Gb4":  369.99,
   "G4":  392.00,
  "G#4":  415.30,
  "Ab4":  415.30,
   "A4":  440.00,
  "A#4":  466.16,
  "Bb4":  466.16,
   "B4":  493.88,
   "C5":  523.25,
  "C#5":  554.37,
  "Db5":  554.37,
   "D5":  587.33,
  "D#5":  622.25,
  "Eb5":  622.25,
   "E5":  659.26,
   "F5":  698.46,
  "F#5":  739.99,
  "Gb5":  739.99,
   "G5":  783.99,
  "G#5":  830.61,
  "Ab5":  830.61,
   "A5":  880.00,
  "A#5":  932.33,
  "Bb5":  932.33,
   "B5":  987.77,
   "C6": 1046.50,
  "C#6": 1108.73,
  "Db6": 1108.73,
   "D6": 1174.66,
  "D#6": 1244.51,
  "Eb6": 1244.51,
   "E6": 1318.51,
   "F6": 1396.91,
  "F#6": 1479.98,
  "Gb6": 1479.98,
   "G6": 1567.98,
  "G#6": 1661.22,
  "Ab6": 1661.22,
   "A6": 1760.00,
  "A#6": 1864.66,
  "Bb6": 1864.66,
   "B6": 1975.53,
   "C7": 2093.00,
  "C#7": 2217.46,
  "Db7": 2217.46,
   "D7": 2349.32,
  "D#7": 2489.02,
  "Eb7": 2489.02,
   "E7": 2637.02,
   "F7": 2793.83,
  "F#7": 2959.96,
  "Gb7": 2959.96,
   "G7": 3135.96,
  "G#7": 3322.44,
  "Ab7": 3322.44,
   "A7": 3520.00,
  "A#7": 3729.31,
  "Bb7": 3729.31,
   "B7": 3951.07,
   "C8": 4186.01,
  "C#8": 4434.92,
  "Db8": 4434.92,
   "D8": 4698.64,
  "D#8": 4978.03,
  "Eb8": 4978.03
}

song_index = [1]

def fft_analysis(data):
    d = []
    for row in data:
      d.append(row[1])
    yf = fft(d)
    xf = fftfreq(10000, 1 / 48000)
    # xf = xf[0:23998]
    print(type(xf), xf.shape)
    print(type(yf), yf.shape)
    plt.plot(xf, np.abs(yf[:10000]))
    plt.xlim([0, 3e3])
    plt.show()
    y = np.abs(yf)

    d = {}
    for i in range(0, len(xf)):
        if xf[i] > 0:
            d[f"{xf[i]}"] = y[i]

    print(max(d))
    d = sorted(d, key=d.get, reverse=True)

    bucket = []
    for i in d:
        if len(bucket) == 10:
            break
    i = round(float(i))
    if i not in bucket:
        bucket.append(i)

    notes = []
    for i in bucket:
        for note in NOTES_MAP:
            note_freq = NOTES_MAP[note]

            l_r = i - 4
            h_r = i + 4
            if l_r < note_freq and h_r > note_freq:
                notes.append(note)
                break

    print(list(set(notes)))

async def send_output(websocket):
    sample_rate = 44100
    frame_sz = 2048
    hp_lngth = 512
    mn = 27.5
    mx = 4186.01

    file_path = "piano-a_A_major.wav"
    data, sample_rate = librosa.load(file_path, sr = None)
    fmn = librosa.note_to_hz('A0')
    fmx = librosa.note_to_hz('C8')

    ad = data[:22000]
    print('Recording audio data')
    while True:
        # result = subprocess.run(['python', 'test.py'], capture_output=True, text=True)   
        # print(result)
        print('$$$$$$$$$$$$$$$$$$$$$$$')
        audio_data = sd.rec(int(sample_rate * 0.5), samplerate=sample_rate, channels=1)
        sd.wait()
        audio_data = audio_data.flatten()
        print(type(audio_data), type(ad))
        print(len(audio_data), len(ad))
        # print(audio_data)
        print('#########################')
        print(song_index[0])
        pitch, voice, prob = librosa.pyin(audio_data, fmin=mn, fmax=mx, sr=sample_rate, frame_length=frame_sz, hop_length=hp_lngth)
        # fft_analysis(audio_data)
        idx = prob.argmax()
        if (pitch[idx] >= mn):
            note = librosa.hz_to_note(pitch[idx])
            print(note[0])
            await websocket.send(note[0])
        # note = librosa.hz_to_note(pitch[idx])
        # print(note[0])
        # await websocket.send(note[0])
        # i = i + 1
        await asyncio.sleep(1)
        # if message in websocket:
        #     print("Message from frontend: ", message)

async def hc(websocket):
    asyncio.create_task(send_output(websocket))
    async for message in websocket:
        print("Message from frontend: ",message)
        song_index[0] = int(message)

async def main():
    async with websockets.serve(hc, "localhost", 8765):
        await asyncio.Future()

if __name__ == '__main__':
    asyncio.run(main())

# start_server = websockets.serve(send_output, "localhost", 8765)

# asyncio.get_event_loop().run_until_complete(start_server)
# asyncio.get_event_loop().run_forever()

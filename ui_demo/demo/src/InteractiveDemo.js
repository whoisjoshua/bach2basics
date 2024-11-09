import React from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import MdArrowDownward from 'react-icons/lib/md/arrow-downward';
import DimensionsProvider from './DimensionsProvider';
import SoundfontProvider from './SoundfontProvider';

class InteractiveDemo extends React.Component {
  state = {
    feedback: null,
  };

  // Set middle C as target note
  targetNote = MidiNumbers.fromNote('c4');

  // Set range to one octave from C4 to B4
  noteRange = {
    first: MidiNumbers.fromNote('c4'),
    last: MidiNumbers.fromNote('b4'),
  };

  handleNotePlay = (playNote) => (midiNumber) => {
    playNote(midiNumber);
    
    if (midiNumber === this.targetNote) {
      this.setState({ feedback: 'correct' });
    } else {
      this.setState({ feedback: 'wrong' });
    }

    setTimeout(() => {
      this.setState({ feedback: null });
    }, 1000);
  };

  render() {
    const keyboardShortcuts = KeyboardShortcuts.create({
      firstNote: this.noteRange.first,
      lastNote: this.noteRange.last,
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    return (
      <SoundfontProvider
        audioContext={this.props.audioContext}
        instrumentName="acoustic_grand_piano"
        hostname={this.props.soundfontHostname}
        render={({ isLoading, playNote, stopNote }) => (
          <div>
            <div className="text-center">
              <p>Try to play middle C!</p>
              <div style={{ color: '#777' }}>
                <MdArrowDownward size={32} />
              </div>
              
              {this.state.feedback && (
                <div style={{
                  padding: '10px',
                  margin: '10px auto',
                  borderRadius: '4px',
                  backgroundColor: this.state.feedback === 'correct' ? '#4CAF50' : '#f44336',
                  color: 'black',
                  fontWeight: 'bold',
                  width: 'fit-content',
                  minWidth: '120px'
                }}>
                  {this.state.feedback === 'correct' ? '✨ Correct! ✨' : '❌ Try again!'}
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <DimensionsProvider>
                {({ containerWidth }) => (
                  <Piano
                    noteRange={this.noteRange}
                    keyboardShortcuts={keyboardShortcuts}
                    playNote={this.handleNotePlay(playNote)}
                    stopNote={stopNote}
                    disabled={isLoading}
                    width={containerWidth}
                  />
                )}
              </DimensionsProvider>
            </div>
          </div>
        )}
      />
    );
  }
}

export default InteractiveDemo;
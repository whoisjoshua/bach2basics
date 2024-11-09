import React from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import MdArrowDownward from 'react-icons/lib/md/arrow-downward';
import DimensionsProvider from './DimensionsProvider';
import SoundfontProvider from './SoundfontProvider';

class InteractiveDemo extends React.Component {
  state = {
    feedback: null,
    currentNoteIndex: 0
  };

  songNotes = [
    { note: 'b4', display: 'B' },
    { note: 'a4', display: 'A' },
    { note: 'g4', display: 'G' },
    { note: 'b4', display: 'B' },
    { note: 'a4', display: 'A' },
    { note: 'g4', display: 'G' },
    { note: 'g4', display: 'G' },
    { note: 'g4', display: 'G' },
    { note: 'g4', display: 'G' },
    { note: 'a4', display: 'A' },
    { note: 'a4', display: 'A' },
    { note: 'a4', display: 'A' },
    { note: 'b4', display: 'B' },
    { note: 'a4', display: 'A' },
    { note: 'g4', display: 'G' },
  ];

  noteRange = {
    first: MidiNumbers.fromNote('g4'),
    last: MidiNumbers.fromNote('b4'),
  };

  handleNotePlay = (playNote) => (midiNumber) => {
    playNote(midiNumber);
    
    const currentExpectedNote = MidiNumbers.fromNote(this.songNotes[this.state.currentNoteIndex].note);
    
    if (midiNumber === currentExpectedNote) {
      this.setState(prevState => ({
        feedback: 'correct',
        currentNoteIndex: (prevState.currentNoteIndex + 1) % this.songNotes.length
      }));
    } else {
      this.setState({ feedback: 'wrong' });
    }

    setTimeout(() => {
      this.setState({ feedback: null });
    }, 1000);
  };

  renderNoteLabel = ({ keyboardShortcut, midiNumber }) => {
    const noteNames = {
      [MidiNumbers.fromNote('g4')]: 'G',
      [MidiNumbers.fromNote('a4')]: 'A',
      [MidiNumbers.fromNote('b4')]: 'B',
    };
    return noteNames[midiNumber] || '';
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
              <h2 className="mb-4">Hot Cross Buns</h2>
              
              <div style={{ 
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  fontSize: '24px',
                  fontFamily: 'monospace'
                }}>
                  {this.songNotes.map((note, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        backgroundColor: index === this.state.currentNoteIndex ? '#ffe4b5' : 'transparent',
                        border: '1px solid #ddd'
                      }}
                    >
                      {note.display}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <span style={{ backgroundColor: '#ffe4b5', padding: '2px 8px', borderRadius: '4px' }}>
                    Play this note: {this.songNotes[this.state.currentNoteIndex].display}
                  </span>
                </div>
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
                  <div className="piano-container">
                    <Piano
                      noteRange={this.noteRange}
                      keyboardShortcuts={keyboardShortcuts}
                      playNote={this.handleNotePlay(playNote)}
                      stopNote={stopNote}
                      disabled={isLoading}
                      width={containerWidth}
                      renderNoteLabel={this.renderNoteLabel}
                    />
                  </div>
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
import React from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import DimensionsProvider from './DimensionsProvider';
import SoundfontProvider from './SoundfontProvider';

class InteractiveDemo extends React.Component {
  state = {
    feedback: null,
    currentNoteIndex: 0,
    wsConnected: false,
    wsError: null
  };

  ws = null;

  songNotes = [
    // Scale up
    { note: 'c4', display: 'C' },
    { note: 'd4', display: 'D' },
    { note: 'e4', display: 'E' },
    { note: 'f4', display: 'F' },
    { note: 'g4', display: 'G' },
    // Scale down
    { note: 'g4', display: 'G' },
    { note: 'f4', display: 'F' },
    { note: 'e4', display: 'E' },
    { note: 'd4', display: 'D' },
    { note: 'c4', display: 'C' },
    // Repeated notes
    { note: 'c4', display: 'C' },
    { note: 'c4', display: 'C' },
    { note: 'd4', display: 'D' },
    { note: 'd4', display: 'D' },
    { note: 'e4', display: 'E' },
    { note: 'e4', display: 'E' },
    { note: 'f4', display: 'F' },
    { note: 'f4', display: 'F' },
    // Final phrase
    { note: 'g4', display: 'G' },
    { note: 'g4', display: 'G' },
    { note: 'f4', display: 'F' },
    { note: 'e4', display: 'E' },
    { note: 'd4', display: 'D' },
    { note: 'c4', display: 'C' },
  ];

  // Note range C4 through G4
  noteRange = {
    first: MidiNumbers.fromNote('c4'),
    last: MidiNumbers.fromNote('g4'),
  };

  componentDidMount() {
    this.connectWebSocket();
  }

  componentWillUnmount() {
    this.disconnectWebSocket();
  }

  connectWebSocket = () => {
    try {
      this.ws = new WebSocket('ws://localhost:8765');
      
      this.ws.onopen = () => {
        this.setState({ wsConnected: true, wsError: null });
        console.log('WebSocket Connected');
        // Send initial song index
        this.ws.send('1');
      };

      this.ws.onclose = () => {
        this.setState({ wsConnected: false });
        console.log('WebSocket Disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(this.connectWebSocket, 3000);
      };

      this.ws.onerror = (error) => {
        this.setState({ wsError: 'WebSocket connection error' });
        console.error('WebSocket Error:', error);
      };

      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };
    } catch (error) {
      this.setState({ wsError: 'Failed to connect to WebSocket' });
      console.error('WebSocket Connection Error:', error);
    }
  };

  disconnectWebSocket = () => {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  };

  handleWebSocketMessage = (note) => {
    // Convert received note (e.g., "C", "D", "E", "F", "G") to MIDI number
    const midiNote = `${note.toLowerCase()}4`; // Assuming octave 4
    const midiNumber = MidiNumbers.fromNote(midiNote);
    
    // Simulate a note play event
    if (this.playNoteFunction) {
      this.handleNotePlay(this.playNoteFunction)(midiNumber);
    }
  };

  handleNotePlay = (playNote) => (midiNumber) => {
    // Store playNote function for WebSocket use
    this.playNoteFunction = playNote;
    
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
      [MidiNumbers.fromNote('c4')]: 'C',
      [MidiNumbers.fromNote('d4')]: 'D',
      [MidiNumbers.fromNote('e4')]: 'E',
      [MidiNumbers.fromNote('f4')]: 'F',
      [MidiNumbers.fromNote('g4')]: 'G',
    };
    return noteNames[midiNumber] || '';
  };

  // Helper function to group notes for display
  groupNotes = () => {
    const groups = [
      { label: 'Scale Up', end: 5 },
      { label: 'Scale Down', end: 10 },
      { label: 'Repeated Notes', end: 18 },
      { label: 'Final Phrase', end: 24 }
    ];
    
    return this.songNotes.reduce((acc, note, index) => {
      const groupIndex = groups.findIndex(g => index < g.end);
      if (groupIndex === -1) return acc;
      
      if (!acc[groupIndex]) {
        acc[groupIndex] = {
          label: groups[groupIndex].label,
          notes: []
        };
      }
      acc[groupIndex].notes.push({ ...note, index });
      return acc;
    }, []);
  };

  render() {
    const keyboardShortcuts = KeyboardShortcuts.create({
      firstNote: this.noteRange.first,
      lastNote: this.noteRange.last,
      keyboardConfig: [
        { natural: 'a', note: 'c4' },
        { natural: 's', note: 'd4' },
        { natural: 'd', note: 'e4' },
        { natural: 'f', note: 'f4' },
        { natural: 'g', note: 'g4' },
      ],
    });

    const noteGroups = this.groupNotes();

    return (
      <SoundfontProvider
        audioContext={this.props.audioContext}
        instrumentName="acoustic_grand_piano"
        hostname={this.props.soundfontHostname}
        render={({ isLoading, playNote, stopNote }) => (
          <div>
            <div className="text-center">
              <h2 className="mb-4">Row Row Row Your Boat</h2>
              
              {/* WebSocket Status Indicator */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: this.state.wsConnected ? '#4CAF50' : '#f44336',
                color: 'white',
                fontSize: '14px'
              }}>
                {this.state.wsConnected ? 'Audio Input Connected' : 'Audio Input Disconnected'}
              </div>

              {this.state.wsError && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  right: '10px',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  {this.state.wsError}
                </div>
              )}
              
              <div style={{ 
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {noteGroups.map((group, groupIndex) => (
                  <div key={groupIndex} style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      {group.label}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                      fontSize: '24px',
                      fontFamily: 'monospace'
                    }}>
                      {group.notes.map((note, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '4px',
                            backgroundColor: note.index === this.state.currentNoteIndex ? '#ffe4b5' : 'transparent',
                            border: '1px solid #ddd'
                          }}
                        >
                          {note.display}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '20px' }}>
                  <span style={{ 
                    backgroundColor: '#ffe4b5', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
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
                  color: 'white',
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
import React from 'react';
import 'react-piano/dist/styles.css';

import Header from './Header';
import Footer from './Footer';
import InteractiveDemo from './InteractiveDemo';
import './App.css';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-8 offset-md-2">
              <InteractiveDemo 
                audioContext={audioContext} 
                soundfontHostname={soundfontHostname} 
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
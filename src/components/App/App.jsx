import React, { Component } from 'react';
import './App.scss';
import Navbar from '../Navbar/Navbar';
import GameContainer from '../GameContainer/GameContainer';
import Footer from '../Footer/Footer';

/**
 * Main entry, has a GameContainer and other visual/HTML-only components.
 */
export default class App extends Component {
  state = { gameState: 'chooseCharacters' };

  startGame = () => {
    this.setState({gameState: 'game'});
  };

  endGame = () => {
    this.setState({gameState: 'chooseCharacters'});
  };

  componentWillUpdate(nextProps, nextState) {
    if (document.getElementById('footer')) {
      if (nextState.gameState === 'chooseCharacters')
        document.getElementById('footer').style.display = "block";
      else
        document.getElementById('footer').style.display = "none";
    }
  }

  componentWillMount() {
    if (document.getElementById('footer'))
      document.getElementById('footer').style.display = "block";
  }

  render() {
    return (
      <div>
        <Navbar
          gameState={this.state.gameState}
          handleEndGame={this.endGame}
        />
        <div className="outercontainer">
          <div className="container game">
            <GameContainer
              gameState={this.state.gameState}
              handleStartGame={this.startGame}
              handleEndGame={this.endGame}
            />
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}

import React, { Component } from 'react';
import {
  getRandomSyllables,
  getRomanization
} from '../../util';
import './Question.scss';

/**
 * Self-explanatory. Also displays itself.
 */
export default class Question extends Component {
  state = {
    currentAnswer: '',
    currentQuestion: [],
    answerOptions: []
  };

  /**
   * Selects a syllable and some answer options, and set up the state to show them as the current question.
   */
  initializeAsNewQuestion() {
    this.currentQuestion = getRandomSyllables(1,
      this.props.allowedSyllables,
      false,
      this.previousQuestion);

    // Pick some syllables as options for answers
    this.answerOptions = getRandomSyllables(5,
      this.props.allowedSyllables,
      this.currentQuestion,
      false);

    this.setState({
      currentQuestion: this.currentQuestion,
      answerOptions: this.answerOptions
    });

    // Determine which of the answer options are acceptable answers
    this.correctAnswers = [];
    if (this.props.stage === 1 || this.props.stage === 3) // Answers for stage 1 and 3 are romanizations
      this.correctAnswers = this.currentQuestion.map(hex => getRomanization(hex));
    else if (this.props.stage === 2) // Answers for stage 2 are Hangeul syllables
      this.correctAnswers = this.currentQuestion.map(hex => String.fromCharCode(parseInt(hex, 16)));
  }

  getWritingTypeOfAnswerForCurrentStage() {
    if (this.props.stage === 2) return WritingType.HANGEUL;
    else return WritingType.ROMANIZATION;
  }

  getPreviousResultForDisplay() {
    let resultString;

    if (this.previousQuestion.length === 0) {
      // In this case, there has not yet been a question, so show some helper text
      resultString = <div className="previous-result none">Let's go! Which character is this?</div>;
    } else {
      // In this case, there has been a question and an answer already, so show a summary
      let rightAnswer =
        this.getQuestionTextForDisplay(this.previousQuestion)
        + ' = '
        +  this.previousCorrectAnswers[0];

      if (this.previousCorrectAnswers.includes(this.previousChosenAnswer))
        resultString = (
          <div className="previous-result correct" title="Correct answer!">
            <span className="pull-left glyphicon glyphicon-none"/>{rightAnswer}<span className="pull-right glyphicon glyphicon-ok"/>
          </div>
        );
      else
        resultString = (
          <div className="previous-result wrong" title="Wrong answer!">
            <span className="pull-left glyphicon glyphicon-none"/>{rightAnswer}<span className="pull-right glyphicon glyphicon-remove"/>
          </div>
        );
    }
    return resultString;
  }

  getQuestionTextForDisplay(question) {
    if (this.getWritingTypeOfAnswerForCurrentStage() === WritingType.HANGEUL)
      return question.map(s => getRomanization((s))).join(' ');
    else return question.map(s => String.fromCharCode(parseInt(s, 16))).join();
  }

  handleAnswer = chosenAnswer => {
    if (this.props.stage <= 2) // TODO Figure out what this does?
      document.activeElement.blur(); // reset answer button's :active

    // Store this as the previous question/answer
    this.previousQuestion = this.currentQuestion;
    this.previousChosenAnswer = chosenAnswer;
    this.previousCorrectAnswers = this.correctAnswers;

    this.setState({
      previousAnswer: this.previousChosenAnswer,
    });

    // Determine if the correct answer was chosen and adjust the stage progress
    let isCorrectAnswer = this.correctAnswers.includes(chosenAnswer);
    console.log('isCorrectAnswer: ' + isCorrectAnswer);
    this.props.handleAnswer(isCorrectAnswer);
  };

  handleAnswerChange = e => {
    this.setState({currentAnswer: e.target.value.replace(/\s+/g, '')});
  };

  handleSubmitTypedAnswer = e => {
    e.preventDefault();
    if (this.state.currentAnswer !== '') {
      this.handleAnswer(this.state.currentAnswer.toLowerCase());
      this.setState({currentAnswer: ''});
    }
  };

  componentWillMount() {
    this.previousQuestion = [];
    this.previousChosenAnswer = '';
  }

  componentDidMount() {
    this.initializeAsNewQuestion();
  }

  render() {
    let btnClass = "btn btn-default answer-button";
    if ('ontouchstart' in window)
      btnClass += " no-hover"; // disables hover effect on touch screens
    return (
      <div className="text-center question col-xs-12">
        {this.getPreviousResultForDisplay()}
        <div className="big-character">{this.getQuestionTextForDisplay(this.state.currentQuestion)}</div>
        <div className="answer-container">
          {
            this.props.stage < 3 ?
              this.state.answerOptions.map((answer, idx) => {
                return <AnswerButton answer={answer}
                  className={btnClass}
                  key={idx}
                  writingType={this.getWritingTypeOfAnswerForCurrentStage()}
                  handleAnswer={this.handleAnswer} />
              })
            : <div className="answer-form-container">
                <form onSubmit={this.handleSubmitTypedAnswer}>
                  <input autoFocus className="answer-input" type="text" value={this.state.currentAnswer} onChange={this.handleAnswerChange} />
                </form>
              </div>
          }
        </div>
      </div>
    );
  }
}

export let WritingType = {
  ROMANIZATION: 1,
  HANGEUL: 2
};

class AnswerButton extends Component {
  getAnswerTextForDisplay() {
    if (this.props.writingType === WritingType.ROMANIZATION)
      return getRomanization(this.props.answer);
    else return String.fromCharCode(parseInt(this.props.answer, 16));
  }

  render() {
    return (
      <button className={this.props.className} onClick={() => this.props.handleAnswer(this.getAnswerTextForDisplay())}>
        {this.getAnswerTextForDisplay()}
      </button>
    );
  }
}

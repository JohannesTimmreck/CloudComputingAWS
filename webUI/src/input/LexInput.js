/* eslint-disable no-undef */
import React, { Component } from "react";
import PropTypes from "prop-types";
const AWS = require("aws-sdk");
import "./LexInput.css";

class LexChat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: "",
      lexUserId: "chatbot" + Date.now(),
      sessionAttributes: this.props.sessionAttributes,
      visible: "closed",
    };
    this.conversationDivRef = React.createRef();
    this.greetingMsgRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    document.getElementById("inputField").focus();

    let greetingNode = document.createElement("P");
    this.greetingMsgRef.current = greetingNode;
    greetingNode.className = "lexResponse";
    greetingNode.appendChild(document.createTextNode(this.props.greeting));
    greetingNode.appendChild(document.createElement("br"));
    this.conversationDivRef.current.appendChild(greetingNode);
    
    AWS.config.region = this.props.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.props.IdentityPoolId,
    });
    var lexruntime = new AWS.LexRuntime();
    this.lexruntime = lexruntime;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.sessionAttributes &&
      this.props.sessionAttributes !== prevState.sessionAttributes
    ) {
      this.state.sessionAttributes = {
        ...this.state.sessionAttributes,
        ...this.props.sessionAttributes,
      };
    }

    if (this.props.greeting && this.props.greeting !== prevProps.greeting) {
      const greetingNodeRef = this.greetingMsgRef.current;
      if (greetingNodeRef) {
        greetingNodeRef.textContent = this.props.greeting;
      }
    }
  }

  handleClick() {
    this.setState({
      visible: this.state.visible === "open" ? "closed" : "open",
    });
    if (this.props.debugMode === true) {
      console.log(this.state);
    }
  }

  pushChat(event) {
    event.preventDefault();

    var inputFieldText = document.getElementById("inputField");

    if (
      inputFieldText &&
      inputFieldText.value &&
      inputFieldText.value.trim().length > 0
    ) {
      // disable input to show we're sending it
      let inputField = inputFieldText.value.trim();
      inputFieldText.value = "...";
      inputFieldText.locked = true;

      // send it to the Lex runtime
      const params = {
        botAlias: this.props.alias,
        botName: "",
        inputText: inputField,
        userId: this.state.lexUserId,
        sessionAttributes: this.state.sessionAttributes,
      };

      if (this.props.debugMode === true) {
        console.log(JSON.stringify(params));
      }

      this.showRequest(inputField);
      const a = function (err, data) {
        if (err) {
          console.log(err, err.stack);
          this.showError(
            "Error:  " + err.message + " (see console for details)"
          );
        }
        if (data) {
          // capture the sessionAttributes for the next cycle
          this.setState({ sessionAttributes: data.sessionAttributes });
          // show response and/or error/dialog status
          this.showResponse(data);
        }
        // re-enable input
        inputFieldText.value = "";
        inputFieldText.locked = false;
      };

      this.lexruntime.postText(params, a.bind(this));
    }
    // we always cancel form submission
    return false;
  }

  showRequest(daText) {
    const conversationDiv = document.getElementById("conversation");
    const requestPara = document.createElement("P");
    requestPara.className = "userRequest";
    requestPara.appendChild(document.createTextNode(daText));
    const spacer = document.createElement("div");
    spacer.className = "convoSpacer";
    spacer.appendChild(requestPara);
    conversationDiv.appendChild(spacer);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  showError(daText) {
    const conversationDiv = document.getElementById("conversation");
    const errorPara = document.createElement("P");
    errorPara.className = "lexError";
    errorPara.appendChild(document.createTextNode(daText));
    const spacer = document.createElement("div");
    spacer.className = "convoSpacer";
    spacer.appendChild(errorPara);
    conversationDiv.appendChild(spacer);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  showResponse(lexResponse) {
    const conversationDiv = document.getElementById("conversation");
    const responsePara = document.createElement("P");
    responsePara.className = "lexResponse";
    if (lexResponse.message) {
      responsePara.appendChild(document.createTextNode(lexResponse.message));
    }
    if (lexResponse.dialogState === "ReadyForFulfillment") {
      responsePara.appendChild(
        document.createTextNode("Ready for fulfillment")
      );
    }
    const spacer = document.createElement("div");
    spacer.className = "convoSpacer";
    spacer.appendChild(responsePara);
    conversationDiv.appendChild(spacer);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ data: event.target.value });
  }

  render() {
    return (
      <div id="chatwrapper">
        <div
          id="chat-header-rect"
          className="headerReactStyle"
          onClick={this.handleClick}
        >
          <span />
          <span
            className="headerTitle"
          >
            LOREM IPSUM HEADER
          </span>

          {this.state.visible === "open" ? (
            <span className="chevron top"></span>
          ) : (
            <span className="chevron bottom"></span>
          )}
        </div>
        <div
          id="chatcontainer"
          className={`chatContainerStyle ${this.state.visible}`}
        >
          <div
            id="conversation"
            ref={this.conversationDivRef}
            className="conversationStyle"
          />
          <form
            id="chatform"
            className="chatFormStyle"
            onSubmit={this.pushChat.bind(this)}
          >
            <input
              type="text"
              id="inputField"
              size="40"
              value={this.state.data}
              placeholder="Enter message"
              onChange={this.handleChange.bind(this)}
              className="inputStyle"
            />
          </form>
        </div>
      </div>
    );
  }
}

LexChat.propTypes = {
  alias: PropTypes.string,
  IdentityPoolId: PropTypes.string.isRequired,
  sessionAttributes: PropTypes.object,
  debugMode: PropTypes.bool,
  region: PropTypes.string,
};

LexChat.defaultProps = {
  alias: "$LATEST",
  greeting: "Hello there, how can I help you ?",
  sessionAttributes: {},
  debugMode: false,
  region: "us-east-1",
};

export default LexChat;

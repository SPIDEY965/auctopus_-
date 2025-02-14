/* eslint-disable react/prop-types */
import React, { Component } from "react";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import HighlightOff from "@mui/icons-material/HighlightOff";
import Send from "@mui/icons-material/Send";

import "./ChatComponent.css";
import Tooltip from "@mui/material/Tooltip";

export default class ChatComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageList: [],
      message: "",
    };
    this.chatScroll = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handlePressKey = this.handlePressKey.bind(this);
    this.close = this.close.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount() {
    this.props.user
      .getStreamManager()
      .stream.session.on("signal:chat", (event) => {
        const data = JSON.parse(event.data);
        let messageList = this.state.messageList;
        messageList.push({
          connectionId: event.from.connectionId,
          nickname: data.nickname,
          message: data.message,
        });
        // const document = window.document;
        // setTimeout(() => {
        //   const userImg = document.getElementById(
        //     "userImg-" + (this.state.messageList.length - 1)
        //   );
        //   const video = document.getElementById("video-" + data.streamId);
        //   const avatar = userImg.getContext("2d");
        //   avatar.drawImage(video, 200, 120, 285, 285, 0, 0, 60, 60);
        //   this.props.messageReceived();
        // }, 50);
        this.setState({ messageList: messageList });
        this.scrollToBottom();
      });
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  handlePressKey(event) {
    if (event.key === "Enter") {
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this.props.user && this.state.message) {
      let message = this.state.message.replace(/ +(?= )/g, "");
      if (message !== "" && message !== " ") {
        const data = {
          message: message,
          nickname: this.props.user.getNickname(),
          streamId: this.props.user.getStreamManager().stream.streamId,
        };
        this.props.user.getStreamManager().stream.session.signal({
          data: JSON.stringify(data),
          type: "chat",
        });
      }
    }
    this.setState({ message: "" });
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        this.chatScroll.current.scrollTop =
          this.chatScroll.current.scrollHeight;
      } catch (err) {
        console.log("error In scrollTobottom");
      }
    }, 20);
  }

  close() {
    this.props.close(undefined);
  }

  render() {
    const profileUrl = JSON.parse(localStorage.getItem("user")).profileUrl;
    const styleChat = { display: this.props.chatDisplay };
    // console.log(this.state.messageList.map((data) => console.log(data)));
    // console.log(this.props.user.connectionId);
    return (
      <div id="chatContainer">
        <div id="chatComponent" style={styleChat}>
          <div id="chatToolbar">
            <span id="nickname">{this.props.nickname}</span>님의
            <span id="title"> {this.props.title}</span>
            <IconButton id="closeButton" onClick={this.close}>
              <HighlightOff color="secondary" />
            </IconButton>
          </div>
          <div className="message-wrap" ref={this.chatScroll}>
            {this.state.messageList.map((data, i) => (
              <div
                key={i}
                id="remoteUsers"
                className={
                  "message" +
                  (data.connectionId !== this.props.user.getConnectionId()
                    ? " left"
                    : " right")
                }
              >
                <img
                  src="https://s3-auctopus.s3.ap-northeast-2.amazonaws.com/auctopus_favicon.svg"
                  width="30"
                  height="30"
                  className="user-img"
                />
                <div className="msg-detail">
                  <div className="msg-info">
                    <p> {data.nickname}</p>
                  </div>
                  <div className="msg-content">
                    {/* <span className="triangle" /> */}
                    <p className="text">{data.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div id="messageInput">
            <input
              placeholder="Send a messge"
              id="chatInput"
              value={this.state.message}
              onChange={this.handleChange}
              onKeyPress={this.handlePressKey}
            />
            <Tooltip title="Send message">
              <Fab size="small" id="sendButton" onClick={this.sendMessage}>
                <Send />
              </Fab>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}

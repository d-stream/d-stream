import React, { Component } from "react";
import VideoLayout from "../../components/Video";
import axios from "axios";
import web3 from "../../ethereum/web3";
import { Link } from '../../routes';
import {
  Button,
  Icon,
  Image,
  List,
  Input,
  Divider,
  Comment,
  Modal,
  Header,
  Loader
} from "semantic-ui-react";

class VideoIndex extends Component {
  static async getInitialProps(props) {
    let response;
    response = await axios({
      url: `http://localhost:4000/db/video/${props.query.hash}`,
      method: "get"
    });

    const video = response.data;

    response = await axios({
      url: "http://localhost:4000/db/similarVideos",
      method: "get"
    });
    const similarVideos = response.data;

    response = await axios({
      url: `http://localhost:4000/db/videoAddress/${props.query.hash}`,
      method: "get"
    });


    const videoAddress = response.data;

    return { video, similarVideos };
  }

  componentDidMount = async () => {
    const accounts = await web3.eth.getAccounts();
    let response = await axios({
      url: `http://localhost:4000/db/view/${this.props.video.hash}/${accounts[0]}`,
      method: 'get'
    });
    const firstView = response.data.firstView
    if (firstView === '1') {
      const msg = web3.utils.sha3("view".concat(this.props.video.hash));
      const sig = await web3.eth.personal.sign(msg, accounts[0]);
      response = await axios({
        url: `http://localhost:4000/db/video/submitViewRequest`,
        method: 'post',
        data: {
          sig,
          videoId: this.props.video.id,
          userAddress: accounts[0]
        }

      });
      const message = response.data.message;


    }
  }

  state = {
    modalOpen: false,
    loading: false,
    errorMessage: "",
    sucssesMessage: "",
    numLikes: this.props.video.numLikes,
    numDislikes: this.props.video.numDislikes
  };

  handleClose = () => this.setState({ modalOpen: false, loading: false });

  likeButtonHandler = async () => {
    try {
      this.setState({ modalOpen: true, loading: true });
      const accounts = await web3.eth.getAccounts();

      const msg = web3.utils.sha3("like".concat(this.props.video.hash));

      const sig = await web3.eth.personal.sign(msg, accounts[0]);






      const response = await axios({
        url: "http://localhost:4000/db/video/like",
        method: "post",
        data: {
          hash: this.props.video.hash,
          sig: sig,
          videoId: this.props.video.id,
          userAddress: accounts[0],
          videoAddress: this.props.video.address
        }
      });

      this.setState({
        sucssesMessage: "Like Transaction Submitted Successfully",
        loading: false,
        numLikes: response.data.numLikes,
        numDislikes: response.data.numDislikes
      });
    } catch (err) {
      this.setState({ errorMessage: JSON.stringify(err), loading: false });
    }
  };

  disLikeButtonHandler = async () => {
    try {
      this.setState({ modalOpen: true, loading: true });

      const accounts = await web3.eth.getAccounts();

      const msg = web3.utils.sha3("dislike".concat(this.props.video.hash));

      const sig = await web3.eth.personal.sign(msg, accounts[0]);

      const response = await axios({
        url: "http://localhost:4000/db/video/dislike",
        method: "post",
        data: {
          hash: this.props.video.hash,
          sig: sig,
          videoId: this.props.video.id,
          userAddress: accounts[0],
          videoAddress: this.props.video.address
        }
      });
      this.setState({
        sucssesMessage: "DisLike Transaction Submitted Successfully",
        loading: false,
        numLikes: response.data.numLikes,
        numDislikes: response.data.numDislikes
      });
    } catch (err) {

      this.setState({ errorMessage: JSON.stringify(err), loading: false });
    }
  };

  commentButtonHandler = () => {
    this.setState({ modalOpen: true, loading: true });
    setTimeout(() => {
      this.setState({
        sucssesMessage: "Comment Transaction Submitted Successfully",
        loading: false
      });
    }, 3000);
  };
  renderVideo() {
    return (
      <video
        style={{ width: "100%", height: "480px" }}
        className="video-js vjs-default-skin"
        controls
      >
        <source
          src={`https://ipfs.io/ipfs/${this.props.video.hash}`}
          type="video/mp4"
        />
      </video>
    );
  }
  commentsRender() { }

  renderSimilarVideos() {
    const items = this.props.similarVideos.map(video => {
      return (
        <List.Item key={video.id}>
          <a href={`/videos/${video.hash}`}>
            <Image
              rounded
              style={{
                objectFit: "cover",
                width: "168px",
                height: "94px",
                display: "inline-block"
              }}
              src={video.thumbnail}
            />
          </a>

          <List.Content
            style={{
              display: "inline-block",
              marginLeft: "10px"
            }}
          >
            <List.Header
              style={{
                fontSize: "15px",
                marginBottom: "3px",
                paddingTop: "3px"
              }}
            >
              {video.title}
            </List.Header>
            <List.Description style={{ marginBottom: "3px" }}>
              <Link route={`/profile/${video.userAddress}`}><a>{this.cutAddress(video.userAddress)}</a></Link>
            </List.Description>
            <List.Description style={{ marginBottom: "3px" }}>
              <Icon name="eye" />
              {video.numViews}
            </List.Description>
          </List.Content>
        </List.Item>
      );
    });
    return <List>{items}</List>;
  }
  cutAddress = (video) => {
    let firstPart = '', secondPart = '';
    firstPart = video.substr(0, 5);
    secondPart = video.substr(38, 42);
    return firstPart + '....' + secondPart;
  }

  render() {
    let popUpMessgeSection = null;
    let popUpButton = null;
    let popUpHeader = null;

    if (this.state.loading) {
      popUpHeader = <Header icon="cogs" content="Processing Transaction" />;
      popUpMessgeSection = (
        <div>
          <Loader />
          <div style={{ paddingTop: "65px" }}>
            <p>
              Please wait this might take from 15 to 25 seconds to complete.....
            </p>
          </div>
        </div>
      );
    } else if (this.state.errorMessage) {
      popUpHeader = <Header icon="times" content="Transaction Failed" />;
      popUpButton = (
        <Button color="red" onClick={this.handleClose} inverted>
          <Icon name="checkmark" /> Got it
        </Button>
      );
      popUpMessgeSection = (
        <div>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    } else if (this.state.sucssesMessage) {
      popUpHeader = (
        <Header icon="check" content="Transaction Submitted Successfully" />
      );
      popUpButton = (
        <Button color="green" onClick={this.handleClose} inverted>
          <Icon name="checkmark" /> Got it
        </Button>
      );
      popUpMessgeSection = (
        <div>
          <p>{this.state.sucssesMessage}</p>
        </div>
      );
    }

    return (
      <VideoLayout>
        {this.renderVideo()}
        <Modal
          open={this.state.modalOpen}
          onClose={this.handleClose}
          basic
          size="small"
        >
          {popUpHeader}
          <Modal.Content>{popUpMessgeSection}</Modal.Content>
          <Modal.Actions>{popUpButton}</Modal.Actions>
        </Modal>
        <div
          style={{
            display: "inline-block",
            width: "70%",
            verticalAlign: "top"
          }}
        >
          <p
            style={{
              color: "cornflowerblue",
              fontSize: "15px",
              margin: "10px 30px"
            }}
          >
            {// Video Category
              `#${this.props.video.category}`}
          </p>

          <h4
            style={{
              fontSize: "23px",
              margin: "10px 30px",
              fontFamily: '"Exo 2", sans-serif'
            }}
          >
            {
              // Video Title
              this.props.video.title
            }
          </h4>

          <p
            style={{
              color: "grey",
              fontSize: "17px",
              margin: "5px 30px"
            }}
          >
            {
              // Video Description
              this.props.video.description
            }
          </p>

          <p
            style={{
              color: "grey",
              fontSize: "20px",
              margin: "5px 30px"
            }}
          >
            {
              // # of Views
              this.props.video.numViews
            }{" "}
            views
          </p>

          <div style={{ float: "right", marginRight: "30px" }}>
            <Button
              icon="thumbs up"
              label={{
                basic: true,
                pointing: "right",
                content: this.state.numLikes
              }}
              labelPosition="left"
              onClick={this.likeButtonHandler}
            />

            <Button
              icon="thumbs down"
              label={{
                basic: true,
                pointing: "right",
                content: this.state.numDislikes
              }}
              labelPosition="left"
              onClick={this.disLikeButtonHandler}
            />
          </div>
          <Divider
            style={{ width: "95%", marginTop: "60px", marginLeft: "30px" }}
          />

          <h4
            style={{
              fontSize: "25px",
              margin: "20px 30px",
              fontFamily: '"Exo 2", sans-serif'
            }}
          >
            Comments
          </h4>

          <Comment.Group style={{ margin: "30px 30px" }}>
            <Comment>
              <Comment.Avatar src="https://react.semantic-ui.com/images/avatar/small/joe.jpg" />
              <Comment.Content>
                <Comment.Author style={{ cursor: "pointer" }}>
                  <a>Commenter Address</a>
                </Comment.Author>
                <Comment.Metadata>
                  <div>1 day ago</div>
                </Comment.Metadata>
                <Comment.Text>
                  <p>
                    The hours, minutes and seconds stand as visible reminders
                    that your effort put them all there.
                  </p>
                  <p>
                    Preserve until your next run, when the watch lets you see
                    how Impermanent your efforts are.
                  </p>
                </Comment.Text>
              </Comment.Content>
            </Comment>

            <Comment>
              <Comment.Avatar src="https://react.semantic-ui.com/images/avatar/small/joe.jpg" />
              <Comment.Content>
                <Comment.Author style={{ cursor: "pointer" }}>
                  <a>Commenter Address</a>
                </Comment.Author>
                <Comment.Metadata>
                  <div>1 day ago</div>
                </Comment.Metadata>
                <Comment.Text>
                  <p>
                    The hours, minutes and seconds stand as visible reminders
                    that your effort put them all there.
                  </p>
                  <p>
                    Preserve until your next run, when the watch lets you see
                    how Impermanent your efforts are.
                  </p>
                </Comment.Text>
              </Comment.Content>
            </Comment>
          </Comment.Group>

          <Comment.Group style={{ margin: "30px 30px" }}>
            <Comment>
              <Comment.Avatar
                as="a"
                src="https://react.semantic-ui.com/images/avatar/small/stevie.jpg"
              />
              <Comment.Content>
                <Comment.Text>
                  <Input
                    style={{ width: "100%" }}
                    action={{
                      content: "Comment",
                      onClick: this.commentButtonHandler
                    }}
                    placeholder="Comment..."
                  />
                </Comment.Text>
              </Comment.Content>
            </Comment>
          </Comment.Group>
        </div>
        <div style={{ display: "inline-block", width: "30%" }}>
          <h4
            style={{
              fontSize: "23px",
              marginTop: "10px",
              fontFamily: '"Exo 2", sans-serif'
            }}
          >
            Similar to what you 've watched
          </h4>

          {this.renderSimilarVideos()}
        </div>
      </VideoLayout>
    );
  }
}

export default VideoIndex;

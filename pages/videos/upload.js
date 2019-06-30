import React, { Component } from "react";
import Layout from "../../components/Layout";
import { Form, Input, Button, Message } from "semantic-ui-react";
import axios from "axios";
import { Router } from "../../routes";
import web3 from '../../ethereum/web3';
import dstream from '../../ethereum/dstream';
const IPFSHandler = require('../../ipfsHandler/handler');
class VideoUpload extends Component {
  state = {
    thumbnail: "",
    hash: "",
    title: "",
    category: "",
    description: "",
    uploader: "",
    loading: false,
    errorMessage: ""

  };

  componentDidMount = async () => {



    const accounts = await web3.eth.getAccounts();
    this.setState({
      uploader: accounts[0]
    });

  }

  onSubmit = async () => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: "" });




    let response;
    response = await axios({
      url: `http://localhost:4000/db/videoAddress/${this.state.hash}`,
      method: 'get'
    });


    const video = response.data;

    if (video.message === 'exists') {
      this.setState({ errorMessage: 'It seems like this video has been uploaded before', loading: false })
    }
    else {
      //Checking hash
      const videoType = await IPFSHandler(this.state.hash);
      if (videoType === 'mp4') {

        const metaDataHash = web3.utils.sha3(this.state.title + this.state.description + this.state.category);
        try {

          const result = await dstream.methods.uploadVideo(this.state.hash, metaDataHash, this.state.uploader).send({
            from: this.state.uploader,
            gas: '1500000'
          });

          const videos = await dstream.methods.getUploadedVideos().call();
          const videoAddress = videos[videos.length - 1];

          response = await axios({
            url: `http://localhost:4000/db/upload`,
            method: "post",
            data: {
              hash: this.state.hash,
              title: this.state.title,
              category: this.state.category,
              description: this.state.description,
              thumbnail: this.state.thumbnail,
              uploader: this.state.uploader,
              address: videoAddress
            }
          });
          Router.pushRoute(`/videos/${this.state.hash}`);

        } catch (e) {
          this.setState({ errorMessage: e.message })
        }



      } else {
        this.setState({ errorMessage: 'Please provide a video hash that is uploaded on IPFS', loading: false });
      }
    }
  }


  render() {
    return (
      <Layout>
        <h3 style={{ marginTop: "20px" }}>Upload a Video</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field required>
            <label>IPFS HASH</label>
            <Input
              placeholder="Qm....."
              onChange={event => this.setState({ hash: event.target.value })}
              value={this.state.hash}
            />
          </Form.Field>
          <Form.Field required>
            <label>TITLE</label>
            <Input
              placeholder="GOT Episode 1"
              onChange={event => this.setState({ title: event.target.value })}
              value={this.state.title}
            />
          </Form.Field>
          <Form.Field required>
            <label>CATEGORY</label>
            <Input
              placeholder="Sports"
              onChange={event =>
                this.setState({ category: event.target.value })
              }
              value={this.state.category}
            />
          </Form.Field>
          <Form.Field>
            <label>DESCRIPTION</label>
            <Input
              placeholder="This is a description.."
              onChange={event =>
                this.setState({ description: event.target.value })
              }
              value={this.state.description}
            />
          </Form.Field>
          <Form.Field>
            <label>Thumbnail URL</label>
            <Input
              placeholder="Qm....."
              onChange={event => this.setState({ thumbnail: event.target.value })}
              value={this.state.thumbnail}
            />
          </Form.Field>
          <Button loading={this.state.loading} positive>
            Upload
          </Button>
          <Button negative style={{ marginLeft: "20px" }}>
            Discard
          </Button>

          <Message error header="Oops!" content={this.state.errorMessage} />
        </Form>
      </Layout>
    );
  }
}

export default VideoUpload;

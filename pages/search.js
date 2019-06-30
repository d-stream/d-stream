import React, { Component } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { Icon, Image, List } from "semantic-ui-react";

class VideoIndex extends Component {
  static async getInitialProps(props) {
    let response;

    response = await axios({
      url: `http://localhost:4000/db/search/${props.query.input}`,
      method: "get"
    });
    const searchResults = response.data;
    return { searchResults };
  }


  renderSerachVideosResult() {
    const items = this.props.searchResults.map(video => {
      return (
        <List.Item key={video.id} style={{ marginTop: "20px" }}>
          <a href={`/videos/${video.hash}`}>
            <Image
              rounded
              style={{
                objectFit: "cover",
                width: "248px",
                height: "138px",
                display: "inline-block"
              }}
              src={video.thumbnail}
            />
          </a>

          <List.Content
            style={{
              display: "inline-block",
              marginLeft: "20px"
            }}
          >
            <List.Header
              style={{
                fontSize: "22px",
                marginBottom: "10px"
              }}
            >
              <a
                href={`/videos/${video.hash}`}
                style={{ color: "rgba(0,0,0,.87)" }}
              >
                {video.title}
              </a>
            </List.Header>
            <List.Description style={{ marginBottom: "10px" }}>
              <p>{video.description}</p>
            </List.Description>
            <List.Description style={{ marginBottom: "3px" }}>
              <Icon name="eye" />
              {video.numViews}
            </List.Description>
          </List.Content>
        </List.Item>
      );
    });
    if (items.length > 0)
      return <List>{items}</List>;
    else
      return <h1>No Videos found</h1>
  }

  render() {
    return (
      <Layout>
        <div style={{ display: "inline-block", width: "100%" }}>
          <h4
            style={{
              fontSize: "23px",
              marginTop: "10px",
              fontFamily: '"Exo 2", sans-serif'
            }}
          >
            Search Results
          </h4>

          {this.renderSerachVideosResult()}
        </div>
      </Layout>
    );
  }
}

export default VideoIndex;

import React, { Component } from 'react';
import Layout from '../components/Layout'
const axios = require('axios');
import { Card, Image, Icon } from 'semantic-ui-react'
class DStreamIndex extends Component {

    static async getInitialProps() {
        const trending = await axios({
            url: 'http://localhost:4000/db/trending',
            method: 'get'
        });
        const trendingVideos = trending.data;
        const basedOnLiked = await axios({
            url: 'http://localhost:4000/db/based',
            method: 'get'
        });

        const basedOnLikedVideos = basedOnLiked.data;
        return { trendingVideos, basedOnLikedVideos };
    }
    renderVideos(videos) {
        const items = videos.map((video) => {

            return (<Card key={video.id} href={`/videos/${video.hash}`}>

                <Image
                    style={{
                        objectFit: "cover",
                        width: "290px",
                        height: "150px"
                    }}
                    src={video.thumbnail}
                />
                <Card.Content>
                    <Card.Header style={{ fontSize: "16px" }}>
                        {video.title}
                    </Card.Header>
                    <Card.Description>{video.description}</Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <Icon name="eye" />
                    {video.numViews}
                </Card.Content>
            </Card>);
        });

        return <Card.Group itemsPerRow={4}>{items}</Card.Group>;
    }

    render() {
        return (



            <Layout>


                <h4
                    style={{
                        fontSize: "23px",
                        margin: "15px",
                        fontFamily: '"Exo 2", sans-serif'
                    }}
                >
                    Trending Videos
        </h4>
                {this.renderVideos(this.props.trendingVideos)}
                <h4
                    style={{
                        fontSize: "23px",
                        margin: "15px",
                        fontFamily: '"Exo 2", sans-serif'
                    }}
                >
                    Based on your liked videos
          </h4>
                {this.renderVideos(this.props.trendingVideos)}
            </Layout >
        );
    }

}
export default DStreamIndex;
import React, { Component } from 'react';
import Layout from '../components/Layout';
import { Card, Image, Icon } from 'semantic-ui-react';
import axios from 'axios';


class Profile extends Component {


    static async getInitialProps(props) {
        const address = props.query.address;
        let response;
        response = await axios({
            url: `http://localhost:4000/db/profile/prevLiked/${address}`,
            method: 'get'
        });
        const previouslyLiked = response.data;

        response = await axios({
            url: `http://localhost:4000/db/profile/uploaded/${address}`,
            method: 'get'
        });
        const uploadedVideos = response.data;






        return { previouslyLiked, uploadedVideos };



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
                    Uploaded Videos
      </h4>
                {this.renderVideos(this.props.uploadedVideos)}
                <h4
                    style={{
                        fontSize: "23px",
                        margin: "15px",
                        fontFamily: '"Exo 2", sans-serif'
                    }}
                >
                    Previously Liked Videos
        </h4>
                {this.renderVideos(this.props.previouslyLiked)}
            </Layout >
        );
    }

}

export default Profile;

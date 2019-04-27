pragma solidity ^0.4.25;
contract DStream{
    
    //checking if the video's hash is already uploaded or not.
    mapping(string=>bool)videos;
    
    //array to store addresses of the uploaded videos on DStream's platform
    address [] public uploadedVideos;
    
    function uploadVideo(string memory ipfsHash, string memory title, string memory description, string memory category)public{
        require(!videos[ipfsHash]);
        videos[ipfsHash]=true;
        address newVideo = address (new Video(ipfsHash,title,description,category,msg.sender));
        uploadedVideos.push(newVideo);
        
    }
    
    function getUploadedVideos() public view returns (address[] memory){
        return uploadedVideos;
    }
    
}


contract Video{
    string public ipfsHash;
    string public title;
    string public description;
    string public category;
    address public owner;
    
    constructor (string memory hash,string memory videoTitle,string memory desc,string memory cat, address uploader) public{
        ipfsHash = hash;
        title=videoTitle;
        description=desc;
        category=cat;
        owner=uploader;
    }
   
  
}
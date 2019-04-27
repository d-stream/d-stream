pragma solidity >=0.4.19 <0.7.0;

contract DStream {
    
    //checking if the video's hash is already uploaded or not.
    mapping(string=>bool)videos;
    
    //array to store addresses of the uploaded videos on DStream's platform
    address [] public uploadedVideos;
    
    function uploadVideo(string memory ipfsHash, string memory metaDataHash, string memory category)public{
        require(!videos[ipfsHash]);
        videos[ipfsHash]=true;
        
        // <-- Explain This Line with comment -->
        address newVideo = address (new Video(msg.sender,ipfsHash,metaDataHash,category));

        uploadedVideos.push(newVideo);
        
    }
    
    function getUploadedVideos() public view returns (address[] memory){
        return uploadedVideos;
    }
    
}


// Video's a smart contract 
contract Video {
    
    // User interaction with video can be either on of these states
    enum Status {LIKING,DISLIKING,NEUTRAL}
    
    // owner of the video Address on ethereum network
    address public owner;

    // hash of the video on IPFS network required for getting video for streammingh\
    string public IPFSHash;

    // hash of meta-Data(title, description, category) used to check for video integrity
    string public metaDataHash;

    // will be used later for filtering user content according to his preferences 
    string public category;

    uint public numOfLikes;
    uint numOFDislikes;
    uint public numOfViews;
    
    // hashTable used to detect whether user has already seen the video 
    mapping(address=>bool) public userToVideoViewStatus;

    // hashTable used to detect user interaction towards the video 
    mapping(address=>Status) public userToVideoInteractionStatus;
    
    // ctor
    constructor(address _owner, string memory _IPFSHash, string memory _metaDataHash,
        string memory _category) public {
            owner = _owner;
            IPFSHash = _IPFSHash;
            metaDataHash = _metaDataHash;
            category = _category;
    }
    
}
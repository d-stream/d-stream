// solium-disable linebreak-style
pragma solidity >=0.4.19 <0.7.0;

contract DStream {
  
    
    //checking if the video's hash is already uploaded or not.
    mapping(string=>bool)videos;
    
    //array to store addresses of the uploaded videos on DStream's platform
    address[] public uploadedVideos;
    
    function uploadVideo(string memory ipfsHash, string memory metaDataHash, string memory category)public{
        require(!videos[ipfsHash]);
        videos[ipfsHash]=true;
        
        // creates a new video contract and stores its address
        address newVideo = address (new Video(msg.sender,ipfsHash,metaDataHash,category));
        
        //push the newly created contract's address to the array
        uploadedVideos.push(newVideo);
        
    }
    
    function getUploadedVideos() public view returns (address[] memory){
        return uploadedVideos;
    }

    function isUploaded(string memory hash) public view returns (bool){
        return videos[hash];
    }
}

// Video's a smart contract 
contract Video {
    
    // User interaction with video can be either on of these states
    enum Status {NEUTRAL,LIKING,DISLIKING}
    
    // owner of the video Address on ethereum network
    address public owner;

    // hash of the video on IPFS network required for getting video for streammingh\
    string public IPFSHash;

    // hash of meta-Data(title, description, category) used to check for video integrity
    string public metaDataHash;

    // will be used later for filtering user content according to his preferences 
    string public category;

    uint public numLikes;
    uint public numDislikes;
    uint public numViews;
    
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


    /* 
        Function used to verify user signture by comparing his address with address
        extracted from signature
    */
    function verify(bytes32 _hash,  bytes memory sig, address _address)
         public pure returns (bool) {
            /*
                 If the prefixedHash and the signtaure (v,r,s) returned the user's address, then we can verify
                     that this user has signed the message with his private key
             */
            
            return recoverSigner(_hash, sig) == _address;
    }
    
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
                

    }
    
    function splitSignature(bytes memory sig)
    public
    pure
    returns (uint8, bytes32, bytes32)
    {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        public
        pure
        returns (address)
    {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(sig);
        
        return ecrecover(prefixed(message), v, r, s);
    }

    function likeVideo(bytes memory _sig, address _user) public{
        
        //We make sure that the user intended to like the video
        //by checking if he signed the message ("like"+ videohash) with his private key
        bytes32 likestamp = keccak256(abi.encodePacked("like",IPFSHash));
         require(verify(likestamp,_sig,_user));
      
        //if the user has liked this video before and clicked the like button again
         if(userToVideoInteractionStatus[_user]==Status.LIKING){
          
            //return the user's status to NEUTRAL
            userToVideoInteractionStatus[_user]=Status.NEUTRAL;
          
            //decrement the video's likes counter
             numLikes--;
          
        }
      
        //if the user likes a video that he disliked before
        else if(userToVideoInteractionStatus[_user]==Status.DISLIKING){
        
            //change user's state to liking
             userToVideoInteractionStatus[_user]=Status.LIKING;
          
            //decrement the video's dislikes counter
             numDislikes--;
          
            //increment the video's likes counter
            numLikes++;
          
        }

      //The user neither liked nor disliked this video before
        else {
          
          //change user's state to liking
          userToVideoInteractionStatus[_user]=Status.LIKING;
          
          //increment the video's likes counter
          numLikes++;
      }
      
  }

    /*
        Disklike function has 3 cases
        if user has already liked the video => it changes user state from like to dislike
        if user hasn't interacted with the video before => it changes user state to dislike
        if user has already disliked the video => it changes user state from like to neutral
     */

    function dislikeVideo(bytes memory _sig, address _user) public {
        /* 
            We make sure that the user intended to like the video
            by checking if he signed the message ("dislike"+ videohash) with his private key
        */
        bytes32 dislikestamp = keccak256(abi.encodePacked("dislike",IPFSHash));
         require(verify(dislikestamp,_sig,_user));

        // Getting current status of user, Default = Netural
        Status userStatus = userToVideoInteractionStatus[_user];

        if (userStatus == Status.LIKING) {
            userToVideoInteractionStatus[_user] = Status.DISLIKING;
            numDislikes++;
            numLikes--;
        } else if (userStatus == Status.NEUTRAL) {
            userToVideoInteractionStatus[_user] = Status.DISLIKING;
            numDislikes++;
        } else {
          userToVideoInteractionStatus[_user] = Status.NEUTRAL;
          numDislikes--;
      }
  }

  function viewVideo(bytes memory _sig, address _user) public{
      require(!userToVideoViewStatus[_user]);
      bytes32 viewstamp = keccak256(abi.encodePacked("view",IPFSHash));
      require(verify(viewstamp,_sig,_user));
      userToVideoViewStatus[_user]=true;
      numViews++;
  }

}
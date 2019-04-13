pragma solidity >=0.4.22 <0.6.0;
contract Dstream{
    
    struct User{
        address userAddress;
        string name;
        string[] likedVideos;
        string[] uploadedVideos;    
    }
    
    struct Video{
        address owner;
        string IPFShash;
        string title;
        string description;
        string category;
        uint numLikes;
        uint numDislikes;
        mapping(address=>Status) likers;

    }
    
    enum Status {neutral,liked,disliked}
    mapping(address=>User) linkedUsers;
    Video[] public videos;
    mapping(string=>string) uploadedVideos;
    
    modifier isRegistered(){
        bytes memory checkUserExistence = bytes(linkedUsers[msg.sender].name);
        require(keccak256(checkUserExistence)!=keccak256(''));
        _;
    }
    modifier notRegistered(){
        bytes memory checkUserExistence = bytes(linkedUsers[msg.sender].name);
        require(keccak256(checkUserExistence)==keccak256(''));
        _;
    }
        
    constructor(string memory name)public{
        registerUser(name);
    }
    
    
    function registerUser(string memory name) public notRegistered{
        
        User memory newUser = User({
            userAddress: msg.sender,
            name:name,
            uploadedVideos:new string[](0),
            likedVideos: new string[](0)
            
        });
        linkedUsers[msg.sender] = newUser;

        
    }
  
    function uploadVideo(string memory title,string memory IPFShash,string memory category,string memory description) public isRegistered{
        
        bytes memory checkHashExists = bytes(uploadedVideos[IPFShash]);
        require(keccak256(checkHashExists)==keccak256(''));
        Video memory newVideo = Video({
            owner:msg.sender,
            IPFShash:IPFShash,
            title:title,
            description:description,
            category:category,
            numLikes:0,
            numDislikes:0
        });
        videos.push(newVideo);
        string memory size = uintToString(videos.length-1);
        uploadedVideos[IPFShash]=size;
        linkedUsers[msg.sender].uploadedVideos.push(IPFShash);
       
    }
	function likeVideo(string memory hash) public  returns (uint){
        uint index = stringToUint(uploadedVideos[hash]);
        Video storage video = videos[index];
        require(video.likers[msg.sender]!=Status.liked);
        video.likers[msg.sender]=Status.liked;
        video.numLikes++;
        linkedUsers[msg.sender].likedVideos.push(video.IPFShash);
        
    }
    function uintToString(uint v) private pure returns (string memory) {
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = byte(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i + 1);
        for (uint j = 0; j <= i; j++) {
            s[j] = reversed[i - j];
        }
       return string(s);
    }
     function stringToUint(string memory s) private pure returns (uint) {
        bytes memory b = bytes(s);
        uint i;
        uint result = 0;
        for (i = 0; i < b.length; i++) {
            uint c = uint(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }
    
   

}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Etch {
    struct Note {
        string title;
        string content;
        uint256 timestamp;
    }

    mapping(address => Note[]) private userNotes;

    function addNote(string calldata _title, string calldata _content) public {
        require(bytes(_title).length > 0, "Invalid title");
        require(bytes(_content).length > 0, "Invalid content");
        userNotes[msg.sender].push(
            Note({title: _title, content: _content, timestamp: block.timestamp})
        );
    }

    function getMyNotesCount() external view returns (uint256) {
        return userNotes[msg.sender].length;
    }

    function getMyNoteByIndex(
        uint256 index
    )
        external
        view
        returns (string memory title, string memory content, uint256 timestamp)
    {
        require(index < userNotes[msg.sender].length, "Invalid index");
        Note storage note = userNotes[msg.sender][index];
        return (note.title, note.content, note.timestamp);
    }

    function getMyNotes() external view returns (Note[] memory) {
        return userNotes[msg.sender];
    }

    function getUserNoteByIndex(
        address user,
        uint256 index
    )
        external
        view
        returns (string memory title, string memory content, uint256 timestamp)
    {
        require(index < userNotes[user].length, "Invalid index");
        Note storage note = userNotes[user][index];
        return (note.title, note.content, note.timestamp);
    }

    function getNotesOf(address user) external view returns (Note[] memory) {
        return userNotes[user];
    }
}

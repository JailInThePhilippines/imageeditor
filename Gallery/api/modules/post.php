<?php

require_once "global.php";

class Post extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function register($data)
    {
        if (empty($data->name) || empty($data->email) || empty($data->password)) {
            return ['status' => 'error', 'message' => 'Name, email, and password are required.'];
        }

        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users_tbl (name, email, password) VALUES (:name, :email, :password)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':password', $hashedPassword);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'User registered successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to register user.'];
        }
    }


    public function login($data)
    {
        $sql = "SELECT * FROM users_tbl WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['password'])) {
            return ['status' => 'success', 'message' => 'Login successful.', 'user' => $user];
        } else {
            return ['status' => 'error', 'message' => 'Invalid email or password.'];
        }
    }

    public function uploadThumbnail($data, $files)
    {
        if (!is_array($data)) {
            $data = json_decode(json_encode($data), true);
        }

        error_log("Received Data: " . print_r($data, true));
        error_log("Received Files: " . print_r($files, true));

        if (empty($data['user_id'])) {
            return ['status' => 'error', 'message' => 'User ID is required.'];
        }

        $targetDir = "uploaded_thumbnail/";
        $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
        $responses = [];

        foreach ($files['name'] as $key => $fileName) {
            $fileType = pathinfo($fileName, PATHINFO_EXTENSION);

            if (!in_array($fileType, $allowTypes)) {
                $responses[] = ['status' => 'error', 'message' => "File type $fileType not allowed for file $fileName."];
                continue;
            }

            $targetFilePath = $targetDir . basename($fileName);
            if (!move_uploaded_file($files['tmp_name'][$key], $targetFilePath)) {
                $responses[] = ['status' => 'error', 'message' => "Failed to upload file $fileName."];
                continue;
            }

            $sql = "INSERT INTO thumbnails (file_path, file_name, user_id, title, description, is_public, timestamp) VALUES (:file_path, :file_name, :user_id, :title, :description, 0, NOW())";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':file_path', $targetFilePath);
            $stmt->bindValue(':file_name', $fileName);
            $stmt->bindValue(':user_id', $data['user_id']);
            $stmt->bindValue(':title', $data['title'] ?? null);
            $stmt->bindValue(':description', $data['description'] ?? null);

            if ($stmt->execute()) {
                $responses[] = ['status' => 'success', 'message' => "File $fileName uploaded successfully."];
            } else {
                $responses[] = ['status' => 'error', 'message' => "Failed to insert file info for $fileName into database."];
            }
        }

        return $responses;
    }


    public function makePublic($data)
    {
        if (empty($data->image_id) || empty($data->user_id)) {
            return ['status' => 'error', 'message' => 'Image ID and User ID are required.'];
        }

        $sql = "UPDATE thumbnails SET is_public = 1 WHERE image_id = :image_id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':image_id', $data->image_id);
        $stmt->bindParam(':user_id', $data->user_id);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Thumbnail made public successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to update thumbnail.'];
        }
    }

    public function makePrivate($data)
    {
        if (empty($data->image_id) || empty($data->user_id)) {
            return ['status' => 'error', 'message' => 'Image ID and User ID are required.'];
        }

        $sql = "UPDATE thumbnails SET is_public = 0 WHERE image_id = :image_id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':image_id', $data->image_id);
        $stmt->bindParam(':user_id', $data->user_id);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Thumbnail made private successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to update thumbnail.'];
        }
    }

    public function deleteThumbnail($data)
    {
        if (empty($data->image_id) || empty($data->user_id)) {
            return ['status' => 'error', 'message' => 'Image ID and User ID are required.'];
        }

        $sql = "DELETE FROM thumbnails WHERE image_id = :image_id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':image_id', $data->image_id);
        $stmt->bindParam(':user_id', $data->user_id);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Thumbnail deleted successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to delete thumbnail.'];
        }
    }

    public function editTitle($data)
    {
        if (empty($data->image_id) || empty($data->user_id) || empty($data->title)) {
            return ['status' => 'error', 'message' => 'Image ID, User ID, and title are required.'];
        }

        $sql = "UPDATE thumbnails SET title = :title WHERE image_id = :image_id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':title', $data->title);
        $stmt->bindParam(':image_id', $data->image_id);
        $stmt->bindParam(':user_id', $data->user_id);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Title updated successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to update title.'];
        }
    }

    public function editDescription($data)
    {
        if (empty($data->image_id) || empty($data->user_id) || empty($data->description)) {
            return ['status' => 'error', 'message' => 'Image ID, User ID, and description are required.'];
        }

        $sql = "UPDATE thumbnails SET description = :description WHERE image_id = :image_id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':description', $data->description);
        $stmt->bindParam(':image_id', $data->image_id);
        $stmt->bindParam(':user_id', $data->user_id);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Description updated successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to update description.'];
        }
    }

    public function addComment($data)
    {
        if (empty($data->comment) || empty($data->user_id) || empty($data->image_id)) {
            return ['status' => 'error', 'message' => 'Comment, User ID, and Image ID are required.'];
        }

        $sql = "SELECT name FROM users_tbl WHERE user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':user_id', $data->user_id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['status' => 'error', 'message' => 'User not found.'];
        }

        $sql = "SELECT image_id FROM thumbnails WHERE image_id = :image_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':image_id', $data->image_id);
        $stmt->execute();
        $image = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$image) {
            return ['status' => 'error', 'message' => 'Image not found.'];
        }

        $sql = "INSERT INTO comments (comment, commenter, user_id, image_id, timestamp) VALUES (:comment, :commenter, :user_id, :image_id, NOW())";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':comment', $data->comment);
        $stmt->bindParam(':commenter', $user['name']);
        $stmt->bindParam(':user_id', $data->user_id);
        $stmt->bindParam(':image_id', $data->image_id);

        if ($stmt->execute()) {
            $commentId = $this->pdo->lastInsertId();
            $sql = "SELECT comment, timestamp, commenter AS user, user_id FROM comments WHERE comment_id = :comment_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':comment_id', $commentId);
            $stmt->execute();
            $newComment = $stmt->fetch(PDO::FETCH_ASSOC);

            return ['status' => 'success', 'data' => $newComment];
        } else {
            return ['status' => 'error', 'message' => 'Failed to add comment.'];
        }
    }

    public function deleteComment($data)
    {
        if (empty($data->comment_id) || empty($data->user_id)) {
            return ['status' => 'error', 'message' => 'Comment ID and User ID are required.'];
        }

        // Verify that the user is the owner of the comment
        $sql = "SELECT user_id FROM comments WHERE comment_id = :comment_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':comment_id', $data->comment_id);
        $stmt->execute();
        $comment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$comment || (string)$comment['user_id'] !== (string)$data->user_id) {
            return ['status' => 'error', 'message' => 'You are not authorized to delete this comment.'];
        }

        // Proceed with deletion
        $sql = "DELETE FROM comments WHERE comment_id = :comment_id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':comment_id', $data->comment_id);
        $stmt->bindParam(':user_id', $data->user_id);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Comment deleted successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to delete comment.'];
        }
    }

    public function saveEditedImage($data)
{
    if (empty($data->image_id) || empty($data->user_id) || empty($data->edited_image)) {
        return ['status' => 'error', 'message' => 'Image ID, User ID, and edited image are required.'];
    }

    $imageId = $data->image_id;
    $userId = $data->user_id;
    $editedImage = $data->edited_image;
    $title = isset($data->title) ? $data->title : '';
    $description = isset($data->description) ? $data->description : '';

    // Decode the base64 image
    $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $editedImage));
    $targetDir = "uploaded_thumbnail/";
    $targetFilePath = $targetDir . "edited_" . uniqid() . ".png";

    if (file_put_contents($targetFilePath, $imageData)) {
        $sql = "UPDATE thumbnails SET file_path = :file_path, title = :title, description = :description WHERE image_id = :image_id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':file_path', $targetFilePath);
        $stmt->bindValue(':title', $title);
        $stmt->bindValue(':description', $description);
        $stmt->bindValue(':image_id', $imageId);
        $stmt->bindValue(':user_id', $userId);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Image edited successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to update image path in database.'];
        }
    } else {
        return ['status' => 'error', 'message' => 'Failed to save edited image.'];
    }
}
}

<?php
require_once "global.php";

class Get extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getThumbnails($data)
    {
        $user_id = $data['user_id'];

        try {
            $stmt = $this->pdo->prepare("SELECT * FROM thumbnails WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();
            $thumbnails = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'status' => 'success',
                'data' => $thumbnails
            ];
        } catch (PDOException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    public function getPublicThumbnails()
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM thumbnails WHERE is_public = 1");
            $stmt->execute();
            $publicThumbnails = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ['status' => 'success', 'data' => $publicThumbnails];
        } catch (PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    public function getImageDetails($data)
    {
        $image_id = $data['image_id'];

        try {
            $stmt = $this->pdo->prepare("
                SELECT t.*, u.name as user 
                FROM thumbnails t 
                JOIN users_tbl u ON t.user_id = u.user_id 
                WHERE t.image_id = :image_id
            ");
            $stmt->bindParam(':image_id', $image_id, PDO::PARAM_INT);
            $stmt->execute();
            $imageDetails = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($imageDetails) {
                return [
                    'status' => 'success',
                    'data' => $imageDetails
                ];
            } else {
                return [
                    'status' => 'error',
                    'message' => 'Image not found'
                ];
            }
        } catch (PDOException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    public function getComments($data)
    {
        $image_id = $data['image_id'];

        try {
            $stmt = $this->pdo->prepare("SELECT c.comment, c.timestamp, c.comment_id, c.user_id, u.name as user FROM comments c JOIN users_tbl u ON c.user_id = u.user_id WHERE c.image_id = :image_id");
            $stmt->bindParam(':image_id', $image_id, PDO::PARAM_INT);
            $stmt->execute();
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'status' => 'success',
                'data' => $comments
            ];
        } catch (PDOException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}

<?php
require_once "./modules/get.php";
require_once "./modules/post.php";
require_once "./config/database.php";

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

// Serve image files with CORS headers
if (isset($_GET['file_path']) && strpos($_GET['file_path'], 'uploaded_thumbnail/') === 0) {
    $filePath = $_GET['file_path'];
    $fullPath = __DIR__ . '/' . $filePath;

    if (file_exists($fullPath)) {
        header('Content-Type: ' . mime_content_type($fullPath));
        header('Content-Length: ' . filesize($fullPath));
        header('Access-Control-Allow-Origin: *');
        readfile($fullPath);
        exit;
    } else {
        echo json_encode(['status' => 'error', 'message' => 'File not found']);
        http_response_code(404);
        exit;
    }
}

$con = new Connection();
$pdo = $con->connect();

$get = new Get($pdo);
$post = new Post($pdo);

if (isset($_REQUEST['request'])) {
    $request = explode('/', $_REQUEST['request']);
} else {
    echo "Not Found";
    http_response_code(404);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        switch ($request[0]) {
            case 'getThumbnails':
                if (isset($request[1]) && is_numeric($request[1])) {
                    $user_id = $request[1];
                    $data = ['user_id' => $user_id];
                    $response = $get->getThumbnails($data);
                    echo json_encode($response);
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Valid user_id is required'
                    ]);
                    http_response_code(400);
                }
                break;

            case 'getPublicThumbnails':
                $response = $get->getPublicThumbnails();
                echo json_encode($response);
                break;

            case 'getImageDetails':
                if (isset($_GET['image_id'])) {
                    $data = ['image_id' => $_GET['image_id']];
                    $response = $get->getImageDetails($data);
                    echo json_encode($response);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Image ID not provided']);
                }
                break;

            case 'getComments':
                if (isset($_GET['image_id'])) {
                    $data = ['image_id' => $_GET['image_id']];
                    $response = $get->getComments($data);
                    echo json_encode($response);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Image ID not provided']);
                }
                break;

            case 'downloadImage':
                if (isset($_GET['file_path'])) {
                    $filePath = $_GET['file_path'];
                    $fullPath = __DIR__ . '/' . $filePath;

                    if (file_exists($fullPath)) {
                        header('Content-Description: File Transfer');
                        header('Content-Type: application/octet-stream');
                        header('Content-Disposition: attachment; filename="' . basename($fullPath) . '"');
                        header('Expires: 0');
                        header('Cache-Control: must-revalidate');
                        header('Pragma: public');
                        header('Content-Length: ' . filesize($fullPath));
                        readfile($fullPath);
                        exit;
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'File not found']);
                        http_response_code(404);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'File path not provided']);
                    http_response_code(400);
                }
                break;

            case 'proxyImage':
                if (isset($_GET['url'])) {
                    $url = $_GET['url'];
                    $ch = curl_init($url);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    $response = curl_exec($ch);
                    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                    curl_close($ch);

                    if ($response !== false) {
                        header('Content-Type: ' . $contentType);
                        echo $response;
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch image']);
                        http_response_code(500);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'URL not provided']);
                    http_response_code(400);
                }
                break;

            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
            case 'register':
                $response = $post->register($data);
                echo json_encode($response);
                break;

            case 'login':
                $response = $post->login($data);
                echo json_encode($response);
                break;

            case 'uploadThumbnail':
                $data = [
                    'user_id' => $_POST['user_id'],
                    'title' => $_POST['title'] ?? null,
                    'description' => $_POST['description'] ?? null
                ];

                // Normalize single file to array
                if (!is_array($_FILES['file']['name'])) {
                    $_FILES['file']['name'] = [$_FILES['file']['name']];
                    $_FILES['file']['type'] = [$_FILES['file']['type']];
                    $_FILES['file']['tmp_name'] = [$_FILES['file']['tmp_name']];
                    $_FILES['file']['error'] = [$_FILES['file']['error']];
                    $_FILES['file']['size'] = [$_FILES['file']['size']];
                }

                $response = $post->uploadThumbnail($data, $_FILES['file']);
                echo json_encode($response);
                break;

            case 'deleteThumbnail':
                $response = $post->deleteThumbnail($data);
                echo json_encode($response);
                break;

            case 'editTitle':
                $response = $post->editTitle($data);
                echo json_encode($response);
                break;

            case 'editDescription':
                $response = $post->editDescription($data);
                echo json_encode($response);
                break;

            case 'makePublic':
                $response = $post->makePublic($data);
                echo json_encode($response);
                break;

            case 'makePrivate':
                $response = $post->makePrivate($data);
                echo json_encode($response);
                break;

            case 'addComment':
                $response = $post->addComment($data);
                echo json_encode($response);
                break;

            case 'deleteComment':
                $response = $post->deleteComment($data);
                echo json_encode($response);
                break;

            case 'saveEditedImage':
                $response = $post->saveEditedImage($data);
                echo json_encode($response);
                break;

            default:
                // Return a 403 response for unsupported requests   
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;

    default:
        // Return a 404 response for unsupported HTTP methods
        echo "Method not available";
        http_response_code(404);
        break;
}

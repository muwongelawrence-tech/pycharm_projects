
import logging
import requests
from pathlib import Path
from urllib.parse import urlparse
from yt_dlp import YoutubeDL

class VideoDownloader:
    def __init__(self):
        logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
        self.logger = logging.getLogger(__name__)

    def is_direct_video_url(self, url: str) -> bool:
        """Check if the URL is a direct video link."""
        parsed = urlparse(url)
        return parsed.path.endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm'))

    def validate_save_path(self, save_path: str) -> Path:
        """Validate and create the save directory if it doesn't exist."""
        path = Path(save_path).resolve()
        path.mkdir(parents=True, exist_ok=True)
        return path

    def download_direct_video(self, video_url: str, save_path: str) -> Path:
        """Download a direct video file."""
        try:
            response = requests.get(video_url, stream=True)
            response.raise_for_status()

            filename = video_url.split("/")[-1].split("?")[0]
            save_path = self.validate_save_path(save_path) / filename

            with open(save_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    file.write(chunk)

            self.logger.info(f"Download completed: {save_path}")
            return save_path
        except Exception as e:
            self.logger.error(f"Download failed: {str(e)}")
            return None

    def download_video(self, video_url: str, save_path: str = "./") -> Path:
        """Download video from YouTube or direct link."""
        save_path = self.validate_save_path(save_path)

        if self.is_direct_video_url(video_url):
            return self.download_direct_video(video_url, save_path)

        ydl_opts = {
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": str(save_path / "%(title)s.%(ext)s"),
        }
        try:
            with YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(video_url, download=True)
                filename = ydl.prepare_filename(info_dict)
            self.logger.info(f"Download completed: {filename}")
            return Path(filename)
        except Exception as e:
            self.logger.error(f"Download failed: {str(e)}")
            return None


def main():
    downloader = VideoDownloader()

    while True:
        video_url = input("\nEnter the video URL (or 'q' to quit): ").strip()
        if video_url.lower() == "q":
            break

        save_path = input("Enter save directory (press Enter for current directory): ").strip() or "./"

        video_path = downloader.download_video(video_url, save_path)
        if video_path:
            print(f"\n✅ Video saved at: {video_path}")
        else:
            print("\n❌ Download failed. Please check the logs.")

        if input("\nDownload another video? (y/n): ").lower() != "y":
            break

    print("\nThank you for using the Video Downloader!")


if __name__ == "__main__":
    main()

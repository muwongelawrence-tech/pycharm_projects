import os
import logging
from typing import Optional
from pathlib import Path
from yt_dlp import YoutubeDL
from urllib.parse import urlparse

class VideoDownloader:
    def __init__(self):
        # Set up logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def validate_url(self, url: str) -> bool:
        """
        Validate if the provided URL is properly formatted and from an allowed domain.
        
        Args:
            url (str): URL to validate
            
        Returns:
            bool: True if URL is valid, False otherwise
        """
        if not url or not isinstance(url, str):
            return False
            
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc]) and (
                'youtube.com' in result.netloc or
                'youtu.be' in result.netloc
            )
        except Exception as e:
            self.logger.error(f"URL validation error: {str(e)}")
            return False

    def validate_save_path(self, save_path: str) -> Optional[Path]:
        """
        Validate and create the save directory if it doesn't exist.
        
        Args:
            save_path (str): Directory path to save downloads
            
        Returns:
            Optional[Path]: Path object if valid, None otherwise
        """
        try:
            path = Path(save_path).resolve()
            path.mkdir(parents=True, exist_ok=True)
            return path
        except Exception as e:
            self.logger.error(f"Path validation error: {str(e)}")
            return None

    def get_video_info(self, video_url: str) -> Optional[dict]:
        """
        Extract video information without downloading.
        
        Args:
            video_url (str): URL of the video
            
        Returns:
            Optional[dict]: Video information if successful, None otherwise
        """
        ydl_opts = {'quiet': True}
        try:
            with YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(video_url, download=False)
        except Exception as e:
            self.logger.error(f"Failed to get video info: {str(e)}")
            return None

    def download_video(self, video_url: str, save_path: str = "./") -> bool:
        """
        Download video with progress tracking and error handling.
        
        Args:
            video_url (str): URL of the video to download
            save_path (str): Directory to save the video
            
        Returns:
            bool: True if download successful, False otherwise
        """
        if not self.validate_url(video_url):
            self.logger.error("Invalid URL provided")
            return False

        path = self.validate_save_path(save_path)
        if not path:
            self.logger.error("Invalid save path")
            return False

        def progress_hook(d):
            if d['status'] == 'downloading':
                percent = d.get('_percent_str', 'N/A')
                speed = d.get('_speed_str', 'N/A')
                self.logger.info(f"Progress: {percent} at {speed}")

        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': str(path / '%(title)s.%(ext)s'),
            'progress_hooks': [progress_hook],
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }

        try:
            info = self.get_video_info(video_url)
            if not info:
                return False

            self.logger.info(f"Title: {info.get('title')}")
            self.logger.info(f"Quality: {info.get('resolution', 'unknown')}")
            self.logger.info(f"Duration: {info.get('duration_string', 'unknown')}")

            with YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
                self.logger.info("Download completed successfully!")
                return True

        except Exception as e:
            self.logger.error(f"Download failed: {str(e)}")
            return False

def main():
    downloader = VideoDownloader()
    
    while True:
        video_url = input("\nEnter the video URL (or 'q' to quit): ").strip()
        if video_url.lower() == 'q':
            break
            
        save_path = input("Enter save directory (press Enter for current directory): ").strip() or "./"
        
        success = downloader.download_video(video_url, save_path)
        if not success:
            print("Download failed. Please check the logs for details.")
        
        if input("\nDownload another video? (y/n): ").lower() != 'y':
            break

    print("\nThank you for using the Video Downloader!")

if __name__ == "__main__":
    main()
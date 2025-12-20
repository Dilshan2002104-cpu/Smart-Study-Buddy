import yt_dlp
import re
from typing import Dict, List, Optional

class YouTubeService:
    """Service for extracting transcripts and metadata from YouTube videos using yt-dlp"""
    
    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """
        Extract video ID from various YouTube URL formats
        Supports:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        """
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com/watch\?.*v=([a-zA-Z0-9_-]{11})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        # If it's already just the video ID
        if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
            return url
            
        return None
    
    @staticmethod
    def get_transcript(video_id: str, languages: List[str] = ['en']) -> Dict:
        """
        Get transcript for a YouTube video using yt-dlp
        
        Args:
            video_id: YouTube video ID
            languages: List of preferred languages (default: ['en'])
            
        Returns:
            Dict containing transcript data with timestamps and metadata
        """
        try:
            url = f"https://www.youtube.com/watch?v={video_id}"
            
            ydl_opts = {
                'skip_download': True,
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': languages,
                'quiet': True,
                'no_warnings': True,
            }
            
            print(f"[INFO] Extracting info for video: {video_id}")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                # Get subtitles
                subtitles = info.get('subtitles', {})
                automatic_captions = info.get('automatic_captions', {})
                
                # Try to find subtitles in preferred language
                subtitle_data = None
                language_used = None
                
                # First try manual subtitles
                for lang in languages:
                    if lang in subtitles:
                        subtitle_data = subtitles[lang]
                        language_used = lang
                        print(f"  [OK] Found manual subtitles in {lang}")
                        break
                
                # If no manual subtitles, try automatic captions
                if not subtitle_data:
                    for lang in languages:
                        if lang in automatic_captions:
                            subtitle_data = automatic_captions[lang]
                            language_used = lang
                            print(f"  [OK] Found auto-generated captions in {lang}")
                            break
                
                if not subtitle_data:
                    return {
                        'success': False,
                        'error': f'No subtitles found for languages: {", ".join(languages)}. This video may not have captions enabled.',
                        'error_type': 'no_subtitles'
                    }
                
                # Download and parse subtitles
                # yt-dlp provides subtitle data in various formats
                # We'll use the first available format
                subtitle_url = None
                for sub in subtitle_data:
                    if 'url' in sub:
                        subtitle_url = sub['url']
                        break
                
                if not subtitle_url:
                    return {
                        'success': False,
                        'error': 'Could not find subtitle URL',
                        'error_type': 'no_subtitle_url'
                    }
                
                # Download subtitle content
                import requests
                response = requests.get(subtitle_url)
                subtitle_content = response.text
                
                # Parse subtitle content (usually in JSON3 or VTT format)
                transcript = YouTubeService._parse_subtitles(subtitle_content)
                
                if not transcript:
                    return {
                        'success': False,
                        'error': 'Could not parse subtitle content',
                        'error_type': 'parse_error'
                    }
                
                # Extract full text
                full_text = ' '.join([entry['text'] for entry in transcript])
                
                # Calculate total duration
                total_duration = 0
                if transcript:
                    last_entry = transcript[-1]
                    total_duration = last_entry['start'] + last_entry['duration']
                
                print(f"  [OK] Successfully extracted {len(transcript)} subtitle entries")
                
                return {
                    'success': True,
                    'video_id': video_id,
                    'language': language_used or 'en',
                    'is_generated': language_used in automatic_captions if language_used else True,
                    'transcript': transcript,
                    'full_text': full_text,
                    'total_duration': total_duration
                }
                
        except Exception as e:
            error_msg = str(e)
            print(f"  [ERROR] {error_msg}")
            
            # Check for specific error types
            if 'Video unavailable' in error_msg:
                return {
                    'success': False,
                    'error': 'Video is unavailable (private, deleted, or doesn\'t exist)',
                    'error_type': 'video_unavailable'
                }
            elif 'age' in error_msg.lower():
                return {
                    'success': False,
                    'error': 'Video is age-restricted and cannot be accessed',
                    'error_type': 'age_restricted'
                }
            else:
                return {
                    'success': False,
                    'error': f'Error extracting transcript: {error_msg}',
                    'error_type': 'unknown_error'
                }
    
    @staticmethod
    def _parse_subtitles(content: str) -> List[Dict]:
        """Parse subtitle content from various formats"""
        import json
        
        transcript = []
        
        try:
            # Try parsing as JSON3 format (YouTube's format)
            if content.startswith('{'):
                data = json.loads(content)
                events = data.get('events', [])
                
                for event in events:
                    if 'segs' in event:
                        text = ''.join([seg.get('utf8', '') for seg in event['segs']])
                        if text.strip():
                            transcript.append({
                                'text': text.strip(),
                                'start': event.get('tStartMs', 0) / 1000.0,
                                'duration': event.get('dDurationMs', 0) / 1000.0
                            })
            
            # If JSON parsing failed or no results, try VTT format
            if not transcript and 'WEBVTT' in content:
                lines = content.split('\n')
                i = 0
                while i < len(lines):
                    line = lines[i].strip()
                    
                    # Look for timestamp line (e.g., "00:00:01.000 --> 00:00:03.000")
                    if '-->' in line:
                        parts = line.split('-->')
                        start_time = YouTubeService._parse_timestamp(parts[0].strip())
                        end_time = YouTubeService._parse_timestamp(parts[1].strip())
                        
                        # Next line(s) contain the text
                        i += 1
                        text_lines = []
                        while i < len(lines) and lines[i].strip() and '-->' not in lines[i]:
                            text_lines.append(lines[i].strip())
                            i += 1
                        
                        if text_lines:
                            transcript.append({
                                'text': ' '.join(text_lines),
                                'start': start_time,
                                'duration': end_time - start_time
                            })
                    
                    i += 1
            
            return transcript
            
        except Exception as e:
            print(f"  [WARNING] Subtitle parsing error: {e}")
            return []
    
    @staticmethod
    def _parse_timestamp(timestamp: str) -> float:
        """Convert timestamp string to seconds"""
        # Format: HH:MM:SS.mmm or MM:SS.mmm
        parts = timestamp.split(':')
        
        if len(parts) == 3:
            hours, minutes, seconds = parts
            return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
        elif len(parts) == 2:
            minutes, seconds = parts
            return int(minutes) * 60 + float(seconds)
        else:
            return float(timestamp)
    
    @staticmethod
    def get_video_metadata(video_id: str) -> Dict:
        """
        Get basic video metadata using yt-dlp
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            Dict containing video metadata
        """
        try:
            url = f"https://www.youtube.com/watch?v={video_id}"
            
            ydl_opts = {
                'skip_download': True,
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                return {
                    'success': True,
                    'title': info.get('title', 'Unknown Title'),
                    'author_name': info.get('uploader', 'Unknown Channel'),
                    'thumbnail_url': info.get('thumbnail', ''),
                    'video_id': video_id,
                    'duration': info.get('duration', 0)
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to fetch video metadata: {str(e)}',
                'video_id': video_id
            }
    
    @staticmethod
    def format_timestamp(seconds: float) -> str:
        """Convert seconds to MM:SS or HH:MM:SS format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{secs:02d}"
        else:
            return f"{minutes}:{secs:02d}"

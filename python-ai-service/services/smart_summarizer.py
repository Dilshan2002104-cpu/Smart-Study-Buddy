import re
from typing import List, Dict, Tuple
from services.gemini_service import GeminiService

class SmartSummarizer:
    """
    Intelligent video summarization service that detects sections,
    chunks content intelligently, and creates comprehensive summaries
    """
    
    def __init__(self):
        self.gemini_service = GeminiService()
        self.min_section_duration = 300  # 5 minutes minimum per section
        self.max_chunk_words = 1500  # Maximum words per chunk
        
    def detect_sections(self, transcript_entries: List[Dict]) -> List[Dict]:
        """
        Detect logical sections in the video transcript
        
        Returns list of sections with:
        - start_time: When section begins
        - end_time: When section ends
        - title: Detected or generated section title
        - entries: Transcript entries in this section
        """
        sections = []
        current_section = None
        
        # Transition keywords that indicate topic changes
        transition_keywords = [
            r'\bnow\s+let\'?s\b',
            r'\bnext\s+we\'?ll\b',
            r'\bmoving\s+on\b',
            r'\bin\s+this\s+section\b',
            r'\blet\'?s\s+talk\s+about\b',
            r'\blet\'?s\s+discuss\b',
            r'\blet\'?s\s+look\s+at\b',
            r'\bchapter\s+\d+\b',
            r'\bpart\s+\d+\b',
        ]
        
        for i, entry in enumerate(transcript_entries):
            text = entry['text'].lower()
            
            # Check for transition keywords
            is_transition = any(re.search(pattern, text) for pattern in transition_keywords)
            
            # Also check for long pauses (potential section breaks)
            is_long_pause = False
            if i > 0:
                time_gap = entry['start'] - (transcript_entries[i-1]['start'] + transcript_entries[i-1]['duration'])
                is_long_pause = time_gap > 3.0  # 3 second pause
            
            # Start new section if transition detected or long pause
            if is_transition or (is_long_pause and current_section and len(current_section['entries']) > 10):
                if current_section and current_section['entries']:
                    # Calculate duration
                    duration = current_section['end_time'] - current_section['start_time']
                    
                    # Only save if section is long enough
                    if duration >= self.min_section_duration:
                        sections.append(current_section)
                
                # Start new section
                current_section = {
                    'start_time': entry['start'],
                    'end_time': entry['start'] + entry['duration'],
                    'title': self._extract_topic_title(entry['text']),
                    'entries': [entry]
                }
            elif current_section:
                # Add to current section
                current_section['entries'].append(entry)
                current_section['end_time'] = entry['start'] + entry['duration']
            else:
                # First section
                current_section = {
                    'start_time': entry['start'],
                    'end_time': entry['start'] + entry['duration'],
                    'title': 'Introduction',
                    'entries': [entry]
                }
        
        # Add final section
        if current_section and current_section['entries']:
            sections.append(current_section)
        
        # If no sections detected, create time-based sections
        if len(sections) < 2:
            sections = self._create_time_based_sections(transcript_entries)
        
        return sections
    
    def _extract_topic_title(self, text: str) -> str:
        """Extract topic title from transition text"""
        text = text.strip()
        
        # Try to extract what comes after transition keywords
        patterns = [
            r'now let\'?s\s+(?:talk about|discuss|look at)\s+(.+?)(?:\.|,|$)',
            r'next we\'?ll\s+(?:cover|discuss|learn about)\s+(.+?)(?:\.|,|$)',
            r'in this section\s+(?:we\'?ll|we will)\s+(?:cover|discuss|learn)\s+(.+?)(?:\.|,|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                title = match.group(1).strip()
                # Capitalize first letter of each word
                return title.title()
        
        # If no pattern matched, return generic title
        return "Section"
    
    def _create_time_based_sections(self, transcript_entries: List[Dict]) -> List[Dict]:
        """Create sections based on time intervals when topic detection fails"""
        if not transcript_entries:
            return []
        
        total_duration = transcript_entries[-1]['start'] + transcript_entries[-1]['duration']
        
        # Create sections every 15-20 minutes
        section_duration = 900  # 15 minutes
        num_sections = max(3, int(total_duration / section_duration))
        
        sections = []
        entries_per_section = len(transcript_entries) // num_sections
        
        for i in range(num_sections):
            start_idx = i * entries_per_section
            end_idx = (i + 1) * entries_per_section if i < num_sections - 1 else len(transcript_entries)
            
            section_entries = transcript_entries[start_idx:end_idx]
            if section_entries:
                sections.append({
                    'start_time': section_entries[0]['start'],
                    'end_time': section_entries[-1]['start'] + section_entries[-1]['duration'],
                    'title': f'Part {i + 1}',
                    'entries': section_entries
                })
        
        return sections
    
    def create_chunks(self, section: Dict) -> List[Dict]:
        """
        Break a section into manageable chunks for summarization
        
        Each chunk should be ~1000-1500 words to fit within token limits
        """
        chunks = []
        current_chunk = {
            'start_time': section['start_time'],
            'entries': [],
            'word_count': 0
        }
        
        for entry in section['entries']:
            words = entry['text'].split()
            word_count = len(words)
            
            # If adding this entry exceeds max words, save current chunk
            if current_chunk['word_count'] + word_count > self.max_chunk_words and current_chunk['entries']:
                current_chunk['end_time'] = current_chunk['entries'][-1]['start'] + current_chunk['entries'][-1]['duration']
                current_chunk['text'] = ' '.join([e['text'] for e in current_chunk['entries']])
                chunks.append(current_chunk)
                
                # Start new chunk
                current_chunk = {
                    'start_time': entry['start'],
                    'entries': [],
                    'word_count': 0
                }
            
            current_chunk['entries'].append(entry)
            current_chunk['word_count'] += word_count
        
        # Add final chunk
        if current_chunk['entries']:
            current_chunk['end_time'] = current_chunk['entries'][-1]['start'] + current_chunk['entries'][-1]['duration']
            current_chunk['text'] = ' '.join([e['text'] for e in current_chunk['entries']])
            chunks.append(current_chunk)
        
        return chunks
    
    def summarize_section(self, section: Dict, section_number: int, total_sections: int) -> Dict:
        """
        Summarize a single section with context about its position
        """
        # Create chunks if section is too long
        chunks = self.create_chunks(section)
        
        if len(chunks) == 1:
            # Section fits in one chunk, summarize directly
            summary = self._summarize_chunk(chunks[0], section['title'], section_number, total_sections)
        else:
            # Section has multiple chunks, summarize each and combine
            chunk_summaries = []
            for i, chunk in enumerate(chunks):
                chunk_summary = self._summarize_chunk(
                    chunk, 
                    f"{section['title']} (Part {i+1}/{len(chunks)})",
                    section_number,
                    total_sections
                )
                chunk_summaries.append(chunk_summary)
            
            # Combine chunk summaries
            summary = '\n\n'.join(chunk_summaries)
        
        return {
            'section_number': section_number,
            'title': section['title'],
            'start_time': section['start_time'],
            'end_time': section['end_time'],
            'summary': summary,
            'timestamp': self._format_timestamp(section['start_time'])
        }
    
    def _summarize_chunk(self, chunk: Dict, title: str, section_num: int, total_sections: int) -> str:
        """Summarize a single chunk using Gemini"""
        prompt = f"""You are summarizing section {section_num} of {total_sections} from an educational video.

Section Title: {title}
Timestamp: {self._format_timestamp(chunk['start_time'])} - {self._format_timestamp(chunk['end_time'])}

Please create a detailed summary of this section that includes:
1. **What You'll Learn** - Main learning objectives
2. **Key Points** - Important concepts and explanations (use bullet points)
3. **Examples** - Any examples or demonstrations mentioned
4. **Important Terms** - Key vocabulary or concepts introduced

Be specific and detailed. This is part of a longer video, so students need comprehensive notes.

Transcript:
{chunk['text']}

Summary:"""
        
        try:
            summary = self.gemini_service.generate_text(prompt)
            return summary
        except Exception as e:
            print(f"Error summarizing chunk: {e}")
            return f"**Summary unavailable for this section.** Please refer to the video at {self._format_timestamp(chunk['start_time'])}."
    
    def create_comprehensive_summary(self, section_summaries: List[Dict], video_title: str, total_duration: float) -> str:
        """
        Combine all section summaries into a comprehensive, navigable summary
        """
        # Build table of contents
        toc_lines = []
        for i, section in enumerate(section_summaries, 1):
            duration_str = f"{self._format_timestamp(section['start_time'])} - {self._format_timestamp(section['end_time'])}"
            toc_lines.append(f"{i}. **{section['title']}** ({duration_str})")
        
        toc = '\n'.join(toc_lines)
        
        # Build section summaries
        section_content = []
        for section in section_summaries:
            section_md = f"""---

## Section {section['section_number']}: {section['title']}
**Timestamp:** {self._format_timestamp(section['start_time'])} - {self._format_timestamp(section['end_time'])}

{section['summary']}"""
            section_content.append(section_md)
        
        sections = '\n\n'.join(section_content)
        
        # Combine everything
        comprehensive_summary = f"""# 📹 Video Summary: {video_title}

**Duration:** {self._format_timestamp(total_duration)} | **Sections:** {len(section_summaries)}

---

## 📑 Table of Contents

{toc}

{sections}

---

## 🎯 Study Tips

- **Use timestamps** to jump to specific topics you want to review
- **Take notes** while watching each section
- **Practice along** with the instructor
- **Use the Q&A feature** to ask questions about specific concepts
- **Generate flashcards** to test your understanding
"""
        
        return comprehensive_summary
    
    def _format_timestamp(self, seconds: float) -> str:
        """Convert seconds to HH:MM:SS or MM:SS format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{secs:02d}"
        else:
            return f"{minutes}:{secs:02d}"
    
    def summarize_video(self, transcript_entries: List[Dict], video_title: str = "Educational Video") -> str:
        """
        Main method to create comprehensive video summary
        
        Args:
            transcript_entries: List of transcript entries with 'text', 'start', 'duration'
            video_title: Title of the video
            
        Returns:
            Comprehensive markdown summary
        """
        if not transcript_entries:
            return "No transcript available for summarization."
        
        print(f"[SmartSummarizer] Starting smart summarization for: {video_title}")
        print(f"[SmartSummarizer] Total transcript entries: {len(transcript_entries)}")
        
        # Calculate total duration
        total_duration = transcript_entries[-1]['start'] + transcript_entries[-1]['duration']
        print(f"[SmartSummarizer] Total duration: {self._format_timestamp(total_duration)}")
        
        # Detect sections
        print("[SmartSummarizer] Detecting sections...")
        sections = self.detect_sections(transcript_entries)
        print(f"[SmartSummarizer] Detected {len(sections)} sections")
        
        # Summarize each section
        section_summaries = []
        for i, section in enumerate(sections, 1):
            print(f"[SmartSummarizer] Summarizing section {i}/{len(sections)}: {section['title']}")
            summary = self.summarize_section(section, i, len(sections))
            section_summaries.append(summary)
        
        # Create comprehensive summary
        print("[SmartSummarizer] Creating comprehensive summary...")
        comprehensive_summary = self.create_comprehensive_summary(
            section_summaries,
            video_title,
            total_duration
        )
        
        print("[SmartSummarizer] Smart summarization complete!")
        return comprehensive_summary

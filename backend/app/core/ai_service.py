from openai import OpenAI
import httpx
from typing import Dict, Any, Optional, List
from fastapi import HTTPException
from ..core.config import settings
import json
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.openai_client = None
        if settings.OPENAI_API_KEY:
            self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_content(
        self,
        tool: str,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate content using AI based on tool type"""
        try:
            if tool == "proposal_generator":
                return await self._generate_proposal(prompt, parameters, context)
            elif tool == "cover_letter":
                return await self._generate_cover_letter(prompt, parameters, context)
            elif tool == "contract_generator":
                return await self._generate_contract(prompt, parameters, context)
            elif tool == "invoice_generator":
                return await self._generate_invoice(prompt, parameters, context)
            elif tool == "price_estimator":
                return await self._estimate_price(prompt, parameters, context)
            elif tool == "task_planner":
                return await self._plan_tasks(prompt, parameters, context)
            elif tool == "communication_template":
                return await self._generate_communication_template(prompt, parameters, context)
            elif tool == "portfolio_case_study":
                return await self._generate_case_study(prompt, parameters, context)
            elif tool == "feedback_analyzer":
                return await self._analyze_feedback(prompt, parameters, context)
            elif tool == "proposal_translator":
                return await self._translate_proposal(prompt, parameters, context)
            elif tool == "time_tracker_summary":
                return await self._generate_time_summary(prompt, parameters, context)
            else:
                return await self._general_generation(prompt, parameters, context)
        except Exception as e:
            logger.error(f"AI generation error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    async def _generate_proposal(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a project proposal"""
        system_prompt = """You are an expert freelancer proposal writer. Generate a professional, compelling project proposal based on the client's requirements. 
        The proposal should include:
        1. Executive Summary
        2. Understanding of Requirements
        3. Proposed Solution
        4. Timeline
        5. Pricing
        6. Why Choose Me
        7. Next Steps
        
        Make it professional, clear, and persuasive."""
        
        user_prompt = f"""
        Client Requirements: {prompt}
        
        Additional Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please generate a comprehensive project proposal.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _generate_cover_letter(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a cover letter or bio"""
        system_prompt = """You are an expert at writing compelling cover letters and professional bios for freelancers. 
        Create engaging, professional content that highlights skills, experience, and value proposition."""
        
        user_prompt = f"""
        Requirements: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please generate a professional cover letter or bio.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _generate_contract(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a contract template"""
        system_prompt = """You are a legal expert specializing in freelance contracts. Generate a comprehensive, professional contract template.
        Include all necessary clauses for freelance work including scope, payment terms, deadlines, intellectual property, and termination clauses.
        Note: This is a template and should be reviewed by a legal professional."""
        
        user_prompt = f"""
        Project Details: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please generate a professional contract template.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _generate_invoice(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate an invoice"""
        system_prompt = """You are an expert at creating professional invoices for freelancers. Generate a clear, detailed invoice with proper formatting.
        Include all necessary details like services provided, rates, hours, taxes, and payment terms."""
        
        user_prompt = f"""
        Invoice Details: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please generate a professional invoice.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _estimate_price(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Estimate project pricing"""
        system_prompt = """You are an expert at pricing freelance projects. Analyze the requirements and provide a detailed pricing estimate.
        Consider factors like complexity, time required, market rates, and value provided. Provide both hourly and fixed-price options."""
        
        user_prompt = f"""
        Project Requirements: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please provide a detailed pricing estimate.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _plan_tasks(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a task plan"""
        system_prompt = """You are a project management expert. Create a detailed task breakdown and timeline for the given project.
        Include dependencies, milestones, and estimated durations."""
        
        user_prompt = f"""
        Project Description: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please create a detailed task plan.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _generate_communication_template(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate communication templates"""
        system_prompt = """You are an expert at creating professional communication templates for freelancers.
        Generate templates for various client communication scenarios like project updates, follow-ups, and issue resolution."""
        
        user_prompt = f"""
        Communication Type: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please generate a professional communication template.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _generate_case_study(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a portfolio case study"""
        system_prompt = """You are an expert at creating compelling portfolio case studies for freelancers.
        Generate a detailed case study that showcases the project, challenges, solutions, and results."""
        
        user_prompt = f"""
        Project Details: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please generate a compelling case study.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _analyze_feedback(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze client feedback"""
        system_prompt = """You are an expert at analyzing client feedback and providing actionable insights.
        Analyze the feedback and provide suggestions for improvement, strengths to highlight, and areas for development."""
        
        user_prompt = f"""
        Client Feedback: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please analyze this feedback and provide insights.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _translate_proposal(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Translate proposal to different language"""
        target_language = parameters.get("target_language", "Spanish") if parameters else "Spanish"
        
        system_prompt = f"""You are an expert translator specializing in business and freelance documents.
        Translate the given proposal to {target_language} while maintaining the professional tone and structure."""
        
        user_prompt = f"""
        Proposal to Translate: {prompt}
        
        Target Language: {target_language}
        
        Context: {context or "None"}
        
        Please translate this proposal professionally.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _generate_time_summary(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate time tracking summary"""
        system_prompt = """You are an expert at analyzing time tracking data and providing productivity insights.
        Analyze the time tracking data and provide a summary with insights, patterns, and recommendations."""
        
        user_prompt = f"""
        Time Tracking Data: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please analyze this time tracking data and provide insights.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _general_generation(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """General content generation"""
        system_prompt = """You are a helpful AI assistant specialized in helping freelancers with their business needs.
        Provide professional, accurate, and helpful responses."""
        
        user_prompt = f"""
        Request: {prompt}
        
        Context: {context or "None"}
        
        Parameters: {json.dumps(parameters or {})}
        
        Please provide a helpful response.
        """
        
        return await self._call_openai(system_prompt, user_prompt)

    async def _call_openai(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Call OpenAI API"""
        if not self.openai_client:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            return {
                "result": response.choices[0].message.content,
                "model": "gpt-3.5-turbo",
                "usage": response.usage.model_dump() if response.usage else None
            }
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# Global AI service instance
ai_service = AIService()

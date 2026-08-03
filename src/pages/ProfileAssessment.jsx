import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Save from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';

const ProfileAssessment = () => {
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [responses, setResponses] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const errorMessage = (err, fallback) => {
    const statusCode = err.response?.status;
    const detail = err.response?.data?.detail;
    if (statusCode === 401) return 'Session expired. Sign in again.';
    if (statusCode === 403) return 'You do not have permission or the required consent.';
    if (statusCode === 404) return 'The requested assessment or page was not found.';
    if (statusCode === 422) return 'Some profile answers are invalid or missing.';
    if (statusCode >= 500) return 'The request could not be completed.';
    return typeof detail === 'string' ? detail : detail?.message || fallback;
  };

  const applyFieldErrors = (err) => {
    const detail = err.response?.data?.detail;
    const questions = detail?.questions || [];
    const questionId = detail?.question_id;
    const nextErrors = {};
    questions.forEach((id) => {
      nextErrors[id] = detail?.code === 'REQUIRED_FIELDS_MISSING' ? 'This answer is required.' : 'This answer is invalid.';
    });
    if (questionId) {
      nextErrors[questionId] = detail?.code === 'INVALID_OPTION' ? 'Choose one of the listed options.' : 'This answer is invalid.';
    }
    setFieldErrors(nextErrors);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [questions, current] = await Promise.all([
          studentService.getProfileAssessmentQuestions(),
          studentService.getCurrentProfileAssessment(),
        ]);
        setContract(questions);
        setResponses(current?.responses ?? {});
      } catch (err) {
        setError(errorMessage(err, 'Unable to load profile assessment.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const steps = useMemo(() => (contract?.steps || []).filter((step) => step !== 'Review and Submit').concat('Review and Submit'), [contract]);
  const questionsByStep = useMemo(() => {
    const grouped = {};
    (contract?.questions || []).forEach((question) => {
      grouped[question.step] = [...(grouped[question.step] || []), question];
    });
    return grouped;
  }, [contract]);

  const stepQuestions = questionsByStep[steps[activeStep]] || [];
  const isReview = steps[activeStep] === 'Review and Submit';
  const hasAnswer = (questionId) => responses[questionId] !== undefined && responses[questionId] !== null && responses[questionId] !== '';
  const requiredMissing = stepQuestions.filter((question) => question.required && !hasAnswer(question.question_id));
  const completedCount = Object.keys(responses).length;
  const progress = contract?.questions?.length ? Math.round((completedCount / contract.questions.length) * 100) : 0;

  const updateResponse = (questionId, value) => {
    setResponses((current) => ({ ...current, [questionId]: value }));
    setError('');
    setDraftMessage('');
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  };

  const saveDraft = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await studentService.saveProfileAssessmentDraft({
        questionnaire_version: contract.questionnaire_version,
        responses,
      });
      if (result?.responses) {
        setResponses(result.responses);
      }
      setDraftMessage('Draft saved.');
    } catch (err) {
      applyFieldErrors(err);
      setError(errorMessage(err, 'Draft could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    if (requiredMissing.length) {
      setError(`Please answer: ${requiredMissing.map((item) => item.label).join(', ')}`);
      return;
    }
    await saveDraft();
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await studentService.submitProfileAssessmentV2({
        questionnaire_version: contract.questionnaire_version,
        responses,
      });
      setSubmitted(result);
    } catch (err) {
      applyFieldErrors(err);
      setError(errorMessage(err, 'Profile assessment could not be submitted.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Stack alignItems="center" spacing={2}><CircularProgress /><Typography>Loading profile assessment...</Typography></Stack>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Stack spacing={2}>
            <CheckCircle color="success" sx={{ fontSize: 48 }} />
            <Typography variant="h4">Profile Assessment Saved</Typography>
            <Alert severity="success">{submitted.message}</Alert>
            <Typography color="text.secondary">
              Assessment status: {submitted.assessment_status || submitted.status}. Prediction status: {submitted.prediction_status || 'unavailable'}. No diagnostic score is shown here.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>Profile Assessment</Typography>
            <Typography color="text.secondary">
              {contract?.description}
            </Typography>
          </Box>

          <Alert severity="info">
            This collects background information for personalized screening support. It is not a diagnosis, not a replacement for DASS-21, and not an emergency assessment.
          </Alert>

          <Box>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">{progress}% answered</Typography>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
            {steps.map((step) => <Step key={step}><StepLabel>{step}</StepLabel></Step>)}
          </Stepper>

          {error && <Alert severity="warning">{error}</Alert>}
          {draftMessage && <Alert severity="success">{draftMessage}</Alert>}

          {isReview ? (
            <Stack spacing={2}>
              <Typography variant="h5">Review Answers</Typography>
              {(contract?.questions || []).map((question) => (
                <Box key={question.question_id} sx={{ borderBottom: '1px solid #e2e8f0', pb: 1 }}>
                  <Typography variant="subtitle2">{question.label}</Typography>
                  <Typography color="text.secondary">{hasAnswer(question.question_id) ? String(responses[question.question_id]) : 'Skipped'}</Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Typography variant="h5">{steps[activeStep]}</Typography>
              {stepQuestions.map((question) => (
                <FormControl key={question.question_id} component="fieldset" required={question.required} fullWidth>
                  <FormLabel component="legend">{question.label}</FormLabel>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{question.help_text}</Typography>
                  <RadioGroup
                    value={responses[question.question_id] ?? ''}
                    onChange={(event) => updateResponse(question.question_id, event.target.value)}
                  >
                    {question.options.map((item) => (
                      <FormControlLabel key={item.value} value={item.value} control={<Radio />} label={item.label} />
                    ))}
                    {!question.required && (
                      <FormControlLabel value="" control={<Radio />} label="Skip optional field" onChange={() => updateResponse(question.question_id, '')} />
                    )}
                  </RadioGroup>
                  {fieldErrors[question.question_id] && <Alert severity="warning" sx={{ mt: 1 }}>{fieldErrors[question.question_id]}</Alert>}
                </FormControl>
              ))}
            </Stack>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
            <Button disabled={activeStep === 0 || saving} onClick={() => setActiveStep((current) => Math.max(current - 1, 0))}>
              Back
            </Button>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button startIcon={<Save />} variant="outlined" disabled={saving} onClick={saveDraft}>
                Save Draft
              </Button>
              {isReview ? (
                <Button variant="contained" disabled={saving} onClick={submit}>
                  Submit
                </Button>
              ) : (
                <Button endIcon={<ArrowForward />} variant="contained" disabled={saving} onClick={goNext}>
                  Save and Continue
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ProfileAssessment;

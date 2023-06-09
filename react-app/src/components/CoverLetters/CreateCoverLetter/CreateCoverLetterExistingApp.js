import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { useMenuSelector } from '../../../context/Menu'
import { fetchAllResumesThunk, fetchSingleResumeThunk } from '../../../store/resume';
import { capitalizeResumeTitle, formatDate, getRomanIndex, numberToRoman } from '../../../utils/format';
import Navigation from '../../Navigation'
import './CreateCoverLetter.css'
import linkIcon from './assets/link-icon.png'
import { updateCoverLetterWithApplicationThunk } from '../../../store/coverletter';
import { fetchSingleApplicationThunk } from '../../../store/application';
import LoadingDefault from '../../Loading/LoadingDefault';
import zipCoverLogo from '../../Navigation/assets/zipcover-logo.png'

export default function CreateCoverLetterExistingApp() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { applicationId } = useParams();
  const application = useSelector(state => state.applications.currentApplication);
  const { setSelectedLink, setSelectedSide } = useMenuSelector()
  const [state, setState] = useState({ isLoaded: false, error: false })
  const allResumes = useSelector(state => state.resumes?.allResumes)
  const resume = useSelector(state => state.resumes?.currentResume)
  const user = useSelector(state => state.session.user);
  const allResumesArray = Object.values(allResumes)
  const [selectedResume, setSelectedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [jobDescription, setJobDescription] = useState(application.job_description);
  const [companyDetails, setCompanyDetails] = useState(application.company_details);
  const outOfCredits = user.generation_balance < 1
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchAsync = async () => {
      const response = await dispatch(fetchAllResumesThunk())
      if (response.error) {
        setState({ isLoaded: true, error: true })
      } else {
        await dispatch(fetchSingleApplicationThunk(applicationId));
        setState({ isLoaded: true, error: false })
      }
      await setSelectedLink('coverletters')
    }
    fetchAsync()
  }, [dispatch])

  const selectResume = async (e, resumeId) => {
    e.preventDefault();
    e.stopPropagation();

    await setSelectedResume(resumeId);
    await dispatch(fetchSingleResumeThunk(resumeId))
  }

  const validate = () => {
    const validationErrors = {};

    if (!jobDescription) validationErrors.jobDescription = 'Job Description is required';
    if (!companyDetails) validationErrors.companyDetails = 'Company Details are required';

    return validationErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    // If no validation errors, submit resume
    if (!Object.keys(validationErrors).length > 0) {
      setLoading(true)
      const response = await dispatch(
        updateCoverLetterWithApplicationThunk(
          resume.id, // resume id
          jobDescription, // job description
          companyDetails, // company details
          'gpt-3.5-turbo', // engine
          applicationId // value needed from somewhere
        ));
      await setSelectedSide('cover letter'); // sets up view in application details
      // Update selected resume in application:

      history.push(`/applications/${response.application.id}`);
    }
  };

  return (
    <>
      <Navigation />
      { loading && <LoadingDefault />}
      { state.isLoaded && !state.error && !loading && (
        <>
          { (selectedResume !== '') && (
          <div 
              className="all-resumes-page-container"
            >
              <div className="all-resumes-body">
                <h1>
                  <span className="form-action">Create a new </span> 
                  <span className="form-title">Cover Letter </span>
                  <span className="form-action">for </span>
                  <span className="form-title">{application.job_title} </span>
                  <span className="form-action">application</span>
                </h1>
                  <div className="resume-name resume-format">
                    <div>{capitalizeResumeTitle(resume.position_type) + ` Resume ${numberToRoman(getRomanIndex(resume, allResumesArray))}`}</div>
                    <img className="link-icon" src={linkIcon} alt="link-icon" />
                  </div>
                  <div className={`resume-input-box ${errors.jobDescription ? 'error' : ''}`}>
                    <div className="input-msg">Paste Job Description</div>
                    <textarea 
                      className=""
                      placeholder='"Fullstack Software Engineer I, OpenAI..."'
                      value={jobDescription}
                      onChange={(e) => {
                        const cleanedText = e.target.value.replace(/\s{3,}/g, ' '); //remove triple whitespaces
                        setJobDescription(cleanedText);
                        setErrors({...errors, jobDescrition: null})
                      }}
                    >
                    </textarea>
                    {errors.jobDescription && <div className="error-message">{errors.jobDescription}</div>}
                  </div>
                <div className={`position-type-box resume-input-box ${errors.companyDetails ? 'error' : ''}`}>
                  <div className="input-msg">Paste Company Details</div>
                  <textarea 
                    className=""
                    placeholder={`The best coverletters are tailored specifically to a company. Here is what works best for this box:
    
    1.  A recent news article or press release regarding company activities (this is ideal!)
    
    2.  A detailed 'About' section from a company website or job site
                    `}
                    value={companyDetails}
                    onChange={(e) => {
                      const cleanedText = e.target.value.replace(/\s{3,}/g, ' '); //remove triple whitespaces
                      setCompanyDetails(cleanedText);
                      setErrors({...errors, companyDetails: null})
                    }}
                  >
                  </textarea>
                  {errors.companyDetails && <div className="error-message">{errors.companyDetails}</div>}
                </div>
                <div 
                  className="submit-container submit-cover"
                  onClick={outOfCredits ? () => setShowPopup(prev => !prev) : null}
                  onMouseLeave={outOfCredits ? () => setShowPopup(false) : null}
                >
                  {showPopup && (
                    <div className="popup">
                      <img className="option-icon" src={zipCoverLogo} alt="zip-cover-logo" />
                      <div>You're out of credits</div>
                    </div>
                  )}
                  <button 
                    className={outOfCredits ? 'submit-button-disabled' : 'submit-button'}
                    onClick={outOfCredits ? null : onSubmit}
                  >
                    Create Cover Letter
                  </button>
                </div>
              </div>
            </div>
          )}
          { !selectedResume && (
            <div 
              className="all-resumes-page-container"
            >
              <div className="all-resumes-body">
                <h1>
                  <span className="form-action">Create a new </span> 
                  <span className="form-title">Cover Letter </span>
                  <span className="form-action">for </span>
                  <span className="form-title">{application.job_title} </span>
                  <span className="form-action">application</span>
                </h1>
                <div>Connect a resume to generate a cover letter</div>
                <div className='resume-input-box'>
                  <div className="input-msg">Connect a resume</div>
                  <div className="resumes-container">
                    { Object.values(allResumes).reverse().map((resume, index) => (
                      <div key={resume.id}>
                        <div 
                          key={resume.id} 
                          className={`resume-overview ${selectedResume === resume.id ? 'selected': ''}`}
                        >
                          <div className="resume-left">
                            <div className="resume-name">
                              {`${capitalizeResumeTitle(resume.position_type)} Resume ${numberToRoman(getRomanIndex(resume, allResumesArray))}`}
                            </div>
                            <div className="dot">•</div>
                            <div className="resume-date">{formatDate(resume.created_at)}</div>
                          </div>
                          <div className="resume-right">
                            <button 
                              className={`create-button resume-connect ${selectedResume === resume.id ? 'selected' : ''}`}
                              onClick={(e) => selectResume(e, resume.id)}
                            >
                              {
                                selectedResume === resume.id ? 
                                <div className="connected">
                                  <img className="loading-icon" src={loading} alt="link-icon" />
                                </div>
                                : <div>Connect</div>
                              }
                            </button>

                          </div>
                        </div>
                        { index < Object.values(allResumes).length - 1 && (
                          <div className="break"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      { state.isLoaded && state.error && !loading && (
        <div className="all-resumes-container">
          <div className="all-resumes-body">
            <h3>No cover letters found, please try again momentarily</h3>
          </div>
        </div>
      )}
    </>
  )
}

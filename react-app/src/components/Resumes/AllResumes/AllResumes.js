import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useMenuSelector } from '../../../context/Menu'
import { deleteResumeThunk, fetchAllResumesThunk } from '../../../store/resume'
import { capitalizeResumeTitle, numberToRoman, getRomanIndex, formatDate } from '../../../utils/format'
import Navigation from '../../Navigation'
import './AllResumes.css'

export default function AllResumes() {
  const dispatch = useDispatch();
  const history = useHistory()
  const { setSelectedLink } = useMenuSelector()
  const [state, setState] = useState({ isLoaded: false, error: false })
  const allResumes = useSelector(state => state.resumes?.allResumes)
  const allResumesArray = Object.values(allResumes)
  const [showDeleteDropdown, setShowDeleteDropdown] = useState([]);

  useEffect(() => {
    const fetchAsync = async () => {
      const response = await dispatch(fetchAllResumesThunk())
      if (response.error) {
        setState({ isLoaded: true, error: true })
      } else {
        setState({ isLoaded: true, error: false })
      }
      await setSelectedLink('resumes');
      setShowDeleteDropdown([]);
    }
    fetchAsync()
  }, [dispatch])

  const handleDelete = async (e, resume) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteDropdown([]);
    await dispatch(deleteResumeThunk(resume.id));
  }

  return (
    <>
      <Navigation />
      { state.isLoaded && !state.error && allResumesArray.length > 0 && (
        <div 
          className="all-resumes-page-container"
          onClick={() => setShowDeleteDropdown(prev => prev.map(() => false))}
        >
          <div className="all-resumes-body">
            <h1><span className="form-action">Manage</span> <span className="form-title">Resumes</span></h1>
            <div>Select a resume to view</div>
            <div className='resume-input-box'>
              <div className="input-msg">Choose a resume</div>
              <div className="resumes-container">
                { Object.values(allResumes).reverse().map((resume, index) => (
                  <div className="resume-wrapper" key={resume.id}>
                    <div key={`${resume.id}-${index}`} className="resume-overview">
                      <div className="resume-left">
                        <div className="resume-name">
                          {`${capitalizeResumeTitle(resume.position_type)} Resume ${numberToRoman(getRomanIndex(resume, allResumesArray))}`}
                        </div>
                        <div className="dot">•</div>
                        <div className="resume-date">{formatDate(resume.created_at)}</div>
                      </div>
                      <div className="resume-right">
                        <button
                          className="view-button"
                          onClick={() => history.push(`/resumes/${resume.id}`)}
                        >
                          View
                        </button>
                        <button
                          className="update-button"
                          onClick={() => history.push(`/resumes/${resume.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowDeleteDropdown(prev => {
                              const newState = [...prev];
                              newState[index] = !newState[index];
                              return newState;
                            })
                          }}
                        >
                          Delete
                        </button>
                        { showDeleteDropdown[index] && (
                          <div className="delete-dropdown">
                            <div>Confirm delete?</div>
                            <div className="delete-options">
                              <button 
                                className="delete-option-button delete-option-yes"
                                onClick={(e) => handleDelete(e, resume)}
                              >
                                Yes
                              </button>
                              <button 
                                className="delete-option-button delete-option-no"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setShowDeleteDropdown(prev => {
                                    const newState = [...prev];
                                    newState[index] = false;
                                    return newState;
                                  })
                                }}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        )}
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
      { state.isLoaded && !state.error && !allResumesArray.length > 0 && (
        <div className="all-resumes-page-container">
          <div className="all-resumes-body">
          <h1><span className="form-action">Manage</span> <span className="form-title">Resumes</span></h1>
            <h4>To upload your first resume:</h4>
            <h4>1. Click the 'New' Button at the top of the screen</h4>
            <h4>2. Selected 'Resume Upload' from the list</h4>
          </div>
        </div>
      )}
      { state.isLoaded && state.error && (
        <div className="all-resumes-page-container">
          <div className="all-resumes-body">
            <h3>No resumes found, please try again momentarily</h3>
          </div>
        </div>
      )}
    </>
  )  
}

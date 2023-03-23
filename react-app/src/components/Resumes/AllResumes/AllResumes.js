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

  useEffect(() => {
    const fetchAsync = async () => {
      const response = await dispatch(fetchAllResumesThunk())
      if (response.error) {
        setState({ isLoaded: true, error: true })
      } else {
        setState({ isLoaded: true, error: false })
      }
      await setSelectedLink('resumes')
    }
    fetchAsync()
  }, [])

  const handleDelete = async (e, resume) => {
    e.preventDefault()
    e.stopPropagation()

    await dispatch(deleteResumeThunk(resume.id));

  }

  return (
    <>
      <Navigation />
      { state.isLoaded && !state.error && (
        <div className="all-resumes-page-container">
          <div className="all-resumes-body">
            <h1><span className="form-action">Manage</span> <span className="form-title">Resumes</span></h1>
            <div>Select a resume to view</div>
            <div className='resume-input-box'>
              <div className="input-msg">Choose a resume</div>
              <div className="resumes-container">
                { Object.values(allResumes).map(resume => (
                  <>
                    <div key={resume.id} className="resume-overview">
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
                          onClick={(e) => handleDelete(e, resume)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="break"></div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      { state.isLoaded && state.error && (
        <div className="all-resumes-container">
        <div className="all-resumes-body">
          <h3>No resumes found, please try again momentarily</h3>
        </div>
      </div>
      )}
    </>
  )
}

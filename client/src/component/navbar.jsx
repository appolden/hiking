import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class NavBar extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="/">
          Hiking
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href=""
                id="navbarDropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Trails
              </a>

              <div
                className="dropdown-menu"
                aria-labelledby="navbarDropdownMenuLink"
              >
                <Link to="/trail/hadrianswallpath" className="dropdown-item">
                  Hadrian's Wall Path
                </Link>
                <Link to="/trail/pacificcresttrail" className="dropdown-item">
                  Pacific Crest Trail
                </Link>
                <Link to="/trail/gr5" className="dropdown-item">
                  GR5
                </Link>
                <Link to="/trail/gr10" className="dropdown-item">
                  GR10
                </Link>
              </div>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href=""
                id="navbarDropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Photos
              </a>
              <div
                className="dropdown-menu"
                aria-labelledby="navbarDropdownMenuLink"
              >
                <a
                  className="dropdown-item"
                  href="https://photos.google.com/share/AF1QipN1jVFAS5JEpF0e36z0Gv6zs7dykIKVjMIgqmw6Xe6AIXzQiD-AMQFy_G3f8_U_Hw?key=N1ktajR1b21LaVVRODJqdV9USVVLMUpacUtmelVB"
                  target="_blank"
                  title="Photos - Pacfic Crest Trail"
                  rel="noopener noreferrer"
                >
                  Pacific Crest Trail
                </a>
                <a
                  className="dropdown-item"
                  href="https://goo.gl/photos/UiJQ6kRm8FWZbjsD7"
                  target="_blank"
                  title="Photos - Peak District"
                  rel="noopener noreferrer"
                >
                  Peak District
                </a>
                <a
                  className="dropdown-item"
                  href="https://photos.google.com/share/AF1QipN-blVlvfdLclA6GDXtXegZBYLF8SldhzwX6OL1PJodJTroJ5Tpeaw-ga7Smj_pAw/story/AF1QipNvcwuF6Ut-hGX9TqCaPOzNYXpPpdtBb_ONcaiPL6aYRDtCcAgS_TkHDQKK-YvjkQ?key=a1JCdFB0TnNoUWpIdkFkRzQzajN3NEd4RkpmczRB"
                  target="_blank"
                  title="Photos - Morocco"
                  rel="noopener noreferrer"
                >
                  Morocco
                </a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

// Must export!
export default NavBar;

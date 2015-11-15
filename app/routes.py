#!/usr/bin/env python
# coding: utf-8

from handlers.base import VersionHandler
from handlers.error import ErrorHandler
from handlers.auth import AuthHandler
from handlers.main import MainHandler,LoginMainHandler,HomeHandler,SideMenuHandler,\
    LionMainHandler,SearchLionHandler,ImageSetMainHandler,SearchImageSetHandler,\
    ConservationistsHandler,ImageGalleryHandler,LocationHistoryHandler,\
    EditMetadataHandler,CVResultsMainHandler,CVRequestMainHandler,UploadImagesHandler
from handlers.api import LionsListHandler, ImagesListHandler, ImageSetsListHandler, OrganizationsListHandler,\
    ImagesUploadHandler, ImagesHandler, LionsHandler, ImageSetsHandler, OrganizationsHandler, CVResultsHandler, CVRequestHandler,\
    LoginHandler

# Defining routes
url_patterns = [
    # Handlers for the website
    (r"/", MainHandler),
    (r"/version", VersionHandler),
    (r"/login.html", LoginMainHandler),
    (r"/home.html", HomeHandler),
    (r"/sidemenu.html", SideMenuHandler),
    (r"/lion.html", LionMainHandler),
    (r"/searchlion.html", SearchLionHandler),
    (r"/imageset.html", ImageSetMainHandler),
    (r"/searchimageset.html", SearchImageSetHandler),
    (r"/conservationists.html", ConservationistsHandler),
    (r"/imagegallery.html", ImageGalleryHandler),
    (r"/locationhistory.html", LocationHistoryHandler),
    (r"/metadata.html", EditMetadataHandler),
    (r"/cvresults.html", CVResultsMainHandler),
    (r"/cvrequest.html", CVRequestMainHandler),
    (r"/uploadimages.html", UploadImagesHandler),
    # Handlers for API comunication
    (r"/imagesets/list", ImageSetsListHandler),
    (r"/imagesets/(\w+)/(cvrequest)$", ImageSetsListHandler),
    (r"/lions/list", LionsListHandler),
    (r"/organizations/list", OrganizationsListHandler),

    (r"/images/list", ImagesListHandler),
    (r"/images/upload", ImagesUploadHandler),

    (r"/images/?$", ImagesHandler),
    (r"/images/(.*)$", ImagesHandler),

    (r"/lions/?$", LionsHandler),
    (r"/lions/(.*)$", LionsHandler),
    (r"/lions/(\w+)/(locations)$", LionsHandler),
    (r"/imagesets/?$", ImageSetsHandler),
    (r"/imagesets/(.*)$", ImageSetsHandler),

    (r"/organizations/?$", OrganizationsHandler),
    (r"/organizations/(.*)$", OrganizationsHandler),

    (r"/cvresults/?$", CVResultsHandler),
    (r"/cvresults/(\w+$)", CVResultsHandler),
    (r"/cvresults/(\w+)/(list)$", CVResultsHandler),

    (r"/cvrequest/?$", CVRequestHandler),
    (r"/cvrequest/(\w+$)", CVRequestHandler),
    (r"/login", LoginHandler)
]

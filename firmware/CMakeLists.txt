cmake_minimum_required(VERSION 3.16)

include($ENV{IDF_PATH}/tools/cmake/project.cmake OPTIONAL RESULT_VARIABLE IDF_FOUND)
if(NOT IDF_FOUND)
    message(STATUS "ESP-IDF environment not set; configuring standalone build for testing/simulation.")
    project(cipheron_x1_firmware C CXX)
else()
    project(cipheron_x1_firmware)
endif()
